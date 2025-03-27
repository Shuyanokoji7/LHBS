from django.db import models
from django.conf import settings
import uuid
from django.utils.timezone import now
from timetable.models import LectureHall, TimeSlot
from django.core.mail import send_mail

class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lecture_hall = models.ForeignKey(LectureHall, on_delete=models.CASCADE)
    date = models.DateField()
    time_slots = models.ManyToManyField(TimeSlot)  # ✅ Allow multiple slots
    purpose = models.TextField(blank=True, null=True)
    approvals_pending = models.JSONField(default=dict)

    ac_required = models.BooleanField(default=False)
    projector_required = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    ACADEMIC = 'academic'
    NON_ACADEMIC = 'non-academic'
    request_time = models.DateTimeField(default=now)  # When booking was requested
    decision_time = models.DateTimeField(null=True, blank=True)  # When approved/rejected
    
    BOOKING_TYPE_CHOICES = [
        (ACADEMIC, 'Academic'),
        (NON_ACADEMIC, 'Non-Academic'),
    ]
    
    booking_type = models.CharField(
        max_length=20,
        choices=BOOKING_TYPE_CHOICES,
        default=NON_ACADEMIC,
    )

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    approval_token = models.UUIDField(default=uuid.uuid4, unique=True)
    approval_tokens = models.JSONField(default=dict)  # {authority_email: token}

    def approve(self, authority_email):
        """Marks approval from a specific authority and updates status."""
        if authority_email in self.approvals_pending:
            self.approvals_pending[authority_email] = True
            self.save()

        if all(self.approvals_pending.values()):
            self.status = 'Approved'
            self.save()
            self._handle_conflicting_bookings()

    def _handle_conflicting_bookings(self):
        """Rejects conflicting bookings for the same time slot and notifies users."""
        conflicting_bookings = Booking.objects.filter(
            date=self.date,
            lecture_hall=self.lecture_hall,
            time_slots__in=self.time_slots.all(),
            status='Pending'
        ).exclude(id=self.id).distinct()  # ✅ Handling multiple time slots

        for booking in conflicting_bookings:
            booking.status = 'Rejected'
            booking.save()
            self._notify_conflicting_booking(booking)

    def _notify_conflicting_booking(self, booking):
        """Notify the user of the rejection of their booking due to a conflict."""
        send_mail(
            subject="Your Booking has been Canceled Due to a Conflict",
            message=(f"Dear {booking.user.username},\n\n"
                     f"Your booking for {booking.lecture_hall.name} on {booking.date} at "
                     f"{', '.join([str(slot) for slot in booking.time_slots.all()])} has been canceled "
                     f"because another user was approved for the same time slot.\n\n"
                     "We apologize for the inconvenience. Please book a different time.\n\n"
                     "Best regards,\nLHC Booking Portal"),
            from_email="noreply@lhcportal.com",
            recipient_list=[booking.user.email],
        )

    def calculate_price(self):
        """Calculate the total price based on AC, projector, and extra slots."""
        total_slots = self.time_slots.count()  # ✅ Multiple slots
        base_hours = 3  # Base price covers up to 3 hours (6 slots)
        base_slots = 6  # 3 hours = 6 slots

        # Get the base price (AC or Non-AC)
        base_price = self.lecture_hall.ac_price if self.ac_required else self.lecture_hall.non_ac_price
        per_slot_price = base_price / base_slots  # Price per 30-minute slot

        # Extra charge: 35% per extra slot beyond base slots
        extra_slots = max(0, total_slots - base_slots)
        extra_charge = (per_slot_price * 0.35) * extra_slots  

        # Projector charge: ₹1000 per slot for L18, L19, L20
        projector_charge = 0
        if self.projector_required and self.lecture_hall.name in ["L18", "L19", "L20"]:
            projector_charge = 1000 * total_slots

        # Final price calculation
        self.price = base_price + extra_charge + projector_charge
        self.save()

    def __str__(self):
        time_slots_str = ", ".join([f"{slot.start_time} - {slot.end_time}" for slot in self.time_slots.all()])
        
        return (
            f"Booking ID: {self.id}\n"
            f"Booking for {self.user.username} on {self.date} at {self.lecture_hall.name} ({self.status})\n"
            f"Booking Type: {self.get_booking_type_display()}\n"  # ✅ Shows 'Academic' or 'Non-Academic'
            f"Time Slots: {time_slots_str}\n"
            f"Purpose: {self.purpose or 'N/A'}\n"
            f"AC Required: {'Yes' if self.ac_required else 'No'}\n"
            f"Projector Required: {'Yes' if self.projector_required else 'No'}\n"
            f"Price: ₹{self.price}"
        )