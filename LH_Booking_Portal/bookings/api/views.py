from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, DestroyAPIView
from user.api.permissions import IsAdmin, IsFaculty, IsStudent 
from django.core.mail import send_mail
from django.db.models import Q
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from timetable.models import FixedLecture, TimeSlot, LectureHall
from bookings.models import Booking
from datetime import datetime
from .serializers import BookingSerializer
import uuid
from datetime import datetime, timedelta, date
from django.utils import timezone
from django.http import HttpResponse
from decimal import Decimal
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from io import BytesIO



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pricing(request):
    lecture_hall_id = request.GET.get("lecture_hall")
    if not lecture_hall_id:
        return Response({"error": "Missing lecture hall ID"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        hall = LectureHall.objects.get(id=lecture_hall_id)
        return Response({
            "capacity": hall.capacity,
            "ac_price": float(hall.ac_price),
            "non_ac_price": float(hall.non_ac_price),
            "projector_price": float(hall.projector_price),
            "extra_charge": round(float(hall.ac_price) * 0.35, 2)
        })
    except LectureHall.DoesNotExist:
        return Response({"error": "Lecture hall not found"}, status=status.HTTP_404_NOT_FOUND)


# Function to check if the date is a holiday
def is_holiday(date):
    # Implement the holiday check (e.g., by looking up from a list or a model of holidays)
    return date.weekday() == 6  # Sunday check (if holiday is Sunday)


def send_approval_email(authority_email, booking):
    authority_token = booking.approval_tokens.get(authority_email)  # Get specific token

    if not authority_token:
        return  # Safety check

    # Separate approval and rejection links per authority
    approval_link = f"http://127.0.0.1:8000/api/bookings/approve/?global_token={booking.approval_token}&authority_token={authority_token}"
    rejection_link = f"http://127.0.0.1:8000/api/bookings/reject/?global_token={booking.approval_token}&authority_token={authority_token}"

    time_slots = ", ".join(f"{ts.start_time} - {ts.end_time}" for ts in booking.time_slots.all())

    send_mail(
        subject="LHC Booking Approval Required",
        message=(
            f"A new booking request needs your approval.\n\n"
            f"Lecture Hall: {booking.lecture_hall.name}\n"
            f"Date: {booking.date}\n"
            f"Time Slots: {time_slots}\n"
            f"Requested by: {booking.user.username}\n\n"
            f"AC Required: {'Yes' if booking.ac_required else 'No'}\n"
            f"Projector Required: {'Yes' if booking.projector_required else 'No'}\n"
            f"Purpose: {booking.purpose}\n\n"
            f"Estimated Price: {booking.price} INR\n\n"
            f"✅ Approve: {approval_link}\n"
            f"❌ Reject: {rejection_link}"
        ),
        from_email="noreply@lhcportal.com",
        recipient_list=[authority_email],
    )

def is_exam_period(booking_date):
    MIDSEM_START_DATE = date(2025, 4, 1)
    MIDSEM_END_DATE = date(2025, 4, 10)
    ENDSEM_START_DATE = date(2025, 5, 1)
    ENDSEM_END_DATE = date(2025, 5, 10)
    
    return MIDSEM_START_DATE <= booking_date <= MIDSEM_END_DATE or \
           ENDSEM_START_DATE <= booking_date <= ENDSEM_END_DATE

def is_holiday_or_sunday(booking_date):
    HOLIDAY_DATES = [date(2025, 12, 25), date(2025, 1, 1)]
    return booking_date.weekday() == 6 or booking_date in HOLIDAY_DATES

def is_at_least_2_days_advance(booking_date):
    return (booking_date - date.today()).days >= 2

class DeleteBookingAPIView(APIView):
    
    permission_classes = [IsAdmin]
    def delete(self, request, booking_id):
        try:
            # Retrieve the booking by the provided booking_id
            booking = Booking.objects.get(id=booking_id)
            
            # Delete the booking
            booking.delete()
            
            # Return a successful response
            return Response({"message": "Booking deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        
        except Booking.DoesNotExist:
            # Handle the case where the booking doesn't exist
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            # Handle any unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class BookingCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id
        serializer = BookingSerializer(data=data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        lecture_hall = data["lecture_hall"]
        date = data["date"]
        time_slots = data["time_slots"]
        booking_type = data["booking_type"]
        ac_required = data["ac_required"]
        projector_required = data["projector_required"]
        purpose = data["purpose"]

        if is_exam_period(date):
            return Response({"error": "Booking is not allowed during midsem or endsem exams."}, status=status.HTTP_400_BAD_REQUEST)

        if booking_type == 'academic' and request.user.role not in ['admin', 'faculty']:
            return Response({"error": "Only faculty/admin can apply for academic bookings."}, status=status.HTTP_400_BAD_REQUEST)

        if booking_type == 'academic' and is_holiday_or_sunday(date):
            return Response({"error": "No academic bookings allowed on holidays or Sundays."}, status=status.HTTP_400_BAD_REQUEST)

        if booking_type == 'non-academic' and date < (datetime.now().date() + timedelta(days=2)):
            return Response({"error": "Non-academic bookings must be made at least 2 days in advance."}, status=status.HTTP_400_BAD_REQUEST)

        # Set booking status based on the role
        if request.user.role in ['admin', 'faculty']:  
            authorities = {}
            approvals_pending = {}  
            booking_status = Booking.STATUS_CHOICES[1][0]  # 'Approved'
        else:
            authorities = list(request.user.authorities.all())  
            if not authorities:
                return Response('No authorities assigned for approval.')  
            approvals_pending = {auth.email: False for auth in authorities}  
            booking_status = Booking.STATUS_CHOICES[0][0]  # 'Pending'

        # Calculate the price only for non-academic bookings
        if booking_type == 'academic':
            total_price = 0
        else:
            base_price = lecture_hall.ac_price if ac_required else lecture_hall.non_ac_price
            per_slot_price = base_price / 6  # 3 hours = 6 slots
            total_slots = len(time_slots)
            extra_slots = max(0, total_slots - 6)  # Extra slots beyond 3 hours
            extra_charge = (per_slot_price * Decimal("0.35")) * extra_slots  

            # Projector charge: Only for L18, L19, L20 at ₹1000 per slot
            projector_charge = 0
            if projector_required and lecture_hall.name in ["L18", "L19", "L20"]:
                projector_charge = 1000 * total_slots  

            # Final price calculation
            total_price = base_price + extra_charge + projector_charge

        # Check for slot conflicts
        existing_bookings = Booking.objects.filter(
            lecture_hall=lecture_hall,
            date=date,
            time_slots__in=time_slots
        ).exclude(status="Rejected").distinct()

        if existing_bookings.exists():
            return Response(
                {"error": "One or more selected slots are already booked or pending."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        approval_tokens = {auth.email: str(uuid.uuid4()) for auth in authorities}
        # Create the booking
        booking = Booking.objects.create(
            user=request.user,
            lecture_hall=lecture_hall,
            date=date,
            status=booking_status,  # Use booking_status here
            approval_tokens = approval_tokens,
            approval_token = str(uuid.uuid4()),  
            approvals_pending={auth.email: False for auth in authorities},
            ac_required=ac_required,
            projector_required=projector_required,
            purpose=purpose,
            price=total_price
        )
        booking.time_slots.set(time_slots)

        # Send approval email
        first_authority_email = next(iter(booking.approvals_pending.keys()), None)
        if first_authority_email:
            send_approval_email(first_authority_email, booking)

        return Response({"message": "Booking request submitted successfully."}, status=status.HTTP_201_CREATED)


class AvailableSlotsAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Requires authentication

    def get(self, request):
        hall_id = request.GET.get("lecture_hall")
        date_str = request.GET.get("date")

        if not hall_id or not date_str:
            return Response({"error": "Missing hall ID or date."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Get occupied slots (both fixed lectures and approved/pending bookings)
        occupied_slots = set(
            FixedLecture.objects.filter(hall_id=hall_id, day=date.strftime('%A')).values_list("time_slot", flat=True)
        ) | set(
            Booking.objects.filter(lecture_hall_id=hall_id, date=date)
            .exclude(status="Rejected")
            .values_list("time_slots", flat=True)
        )

        # Get available slots
        available_slots = TimeSlot.objects.exclude(id__in=occupied_slots).values("id", "start_time", "end_time")

        return Response({"available_slots": list(available_slots)}, status=status.HTTP_200_OK)
    

class ApproveBookingAPIView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request):
        global_token = request.GET.get("global_token")
        authority_token = request.GET.get("authority_token")
        
        if not global_token or not authority_token:
            return Response({"error": "Invalid or missing approval token."}, status=status.HTTP_400_BAD_REQUEST)

        booking = get_object_or_404(Booking, approval_token=global_token)

        # Find the first unapproved authority
        authority_email = next(
            (email for email, token in booking.approval_tokens.items() if token == authority_token),
            None
        )

        if not authority_email:
            return Response({"message": "Booking has already been approved."}, status=status.HTTP_200_OK)

        if booking.status in ["Approved", "Rejected"]:
            return Response({"Booking is already {booking.status}. No further action needed."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.approvals_pending.get(authority_email, False):
            return Response({"error" : "You have already approved this booking."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark the current approver as approved
        booking.approvals_pending[authority_email] = True
        # booking.save(update_fields=["approvals_pending"])

        # Check if all approvals are done
        if all(booking.approvals_pending.values()):
            booking.status = "Approved"
            booking.decision_time = timezone.now()
            booking.save()

            # Send confirmation email to user
            send_mail(
                subject="Booking Approved ✅",
                message=f"Your booking for {booking.lecture_hall.name} on {booking.date} "
                        f"({', '.join([ts.start_time.strftime('%H:%M') for ts in booking.time_slots.all()])}) has been fully approved!",
                from_email="noreply@lhcportal.com",
                recipient_list=[booking.user.email],
            )
            return Response({"message": "Booking fully approved!"}, status=status.HTTP_200_OK)

        booking.save()

        # Send approval request to the next approver
        next_approver_email = next(
            (email for email, approved in booking.approvals_pending.items() if not approved),
            None
        )

        if next_approver_email:
            send_approval_email(next_approver_email, booking)
            
        return Response({"message": "Approval recorded. Waiting for next authority."}, status=status.HTTP_200_OK)

class RejectBookingAPIView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request):
        global_token = request.GET.get("global_token")
        authority_token = request.GET.get("authority_token")

        if not global_token or not authority_token:
            return Response({"error": "Invalid or missing rejection token."}, status=status.HTTP_400_BAD_REQUEST)
        
        if booking.status in ["Approved", "Rejected"]:
            return Response({"message": "Booking is already {booking.status}. No further action needed."}, status=status.HTTP_400_BAD_REQUEST)

        booking = get_object_or_404(Booking, approval_token=global_token)
        booking.status = "Rejected"
        booking.decision_time = timezone.now()
        booking.approvals_pending = {}  
        booking.save()

        send_mail(
            subject="Booking Rejected ❌",
            message=f"Unfortunately, your booking for {booking.lecture_hall.name} on {booking.date} "
                    f"({', '.join([ts.start_time.strftime('%H:%M') for ts in booking.time_slots.all()])}) has been rejected.",
            from_email="noreply@lhcportal.com",
            recipient_list=[booking.user.email],
        )
        return HttpResponse("Booking rejected successfully!")

class PendingApprovalsAPIView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        # Extract user ID from request body
        user_id = request.data.get("user", None)

        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve pending bookings for the specified user
        bookings = Booking.objects.filter(user_id=user_id, status="Pending")
        serializer = BookingSerializer(bookings, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class BookingHistoryAPIView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_id = request.data.get("user", None)

        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve pending bookings for the specified user
        bookings = Booking.objects.filter(user_id=user_id)
        serializer = BookingSerializer(bookings, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)



class GenerateBillAPIView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

    def get(self, request, booking_id):
        """Generate and return a booking bill as a PDF."""
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)  # Ensure user can only access their own bookings

        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(Paragraph("<b>Lecture Hall Booking Invoice</b>", styles["Title"]))
        elements.append(Spacer(1, 12))

        # Format ManyToManyField (Time Slots)
        time_slots = ", ".join(str(slot) for slot in booking.time_slots.all())

        # Booking Details Table
        booking_details = [
            ["Booking ID:", booking.id],
            ["Lecture Hall:", booking.lecture_hall.name],
            ["Date:", booking.date.strftime("%B %d, %Y")],
            ["Time Slots:", time_slots],
            ["Purpose:", booking.purpose],
            ["AC Required:", "Yes" if booking.ac_required else "No"],
            ["Projector Required:", "Yes" if booking.projector_required else "No"],
            ["Booking Type:", booking.get_booking_type_display()],
            ["Total Price:", f"₹{booking.price:.2f}"],
            ["Request Time:", booking.request_time.strftime("%Y-%m-%d %H:%M:%S")],
            ["Decision Time:", booking.decision_time.strftime("%Y-%m-%d %H:%M:%S") if booking.decision_time else "Pending"],
        ]

        table = Table(booking_details, colWidths=[150, 300])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 12))

        # Approval Details
        elements.append(Paragraph("<b>Approval Details</b>", styles["Heading2"]))
        approvals = [["Approver Email", "Status"]]

        for email, status in booking.approvals_pending.items():
            approvals.append([email, "✅ Approved" if status else "❌ Pending"])

        if len(approvals) > 1:
            table_approvals = Table(approvals, colWidths=[300, 200])
            table_approvals.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                ("BACKGROUND", (0, 1), (-1, -1), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(table_approvals)
        else:
            elements.append(Paragraph("No approvals yet.", styles["BodyText"]))
        
        elements.append(Spacer(1, 12))

        # Build PDF
        doc.build(elements)
        print("PDF Elements:", elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"LHC_Bill_{booking_id}.pdf")


class SearchBookingAPIView(ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Booking.objects.filter(date__gte=now().date())  # Future bookings only

        lecture_hall = self.request.query_params.get("lecture_hall")
        user = self.request.query_params.get("user")

        if lecture_hall:
            queryset = queryset.filter(lecture_hall_id=lecture_hall)
        if user:
            queryset = queryset.filter(user_id=user)

        return queryset
