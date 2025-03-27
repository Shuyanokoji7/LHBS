from django import forms
from datetime import datetime
from bookings.models import Booking
from timetable.models import FixedLecture, TimeSlot, LectureHall


class BookingForm(forms.ModelForm):
    time_slots = forms.ModelMultipleChoiceField(
        queryset=TimeSlot.objects.none(),
        widget=forms.CheckboxSelectMultiple,
        required=True
    )
    ac_required = forms.BooleanField(required=False)
    projector_required = forms.BooleanField(required=False)
    purpose = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3, "placeholder": "Enter the purpose of booking..."}),
        required=True
    )

    class Meta:
        model = Booking
        fields = ["lecture_hall", "date", "time_slots", "ac_required", "projector_required", "purpose"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if "lecture_hall" in self.data and "date" in self.data:
            try:
                hall_id = int(self.data.get("lecture_hall"))
                date_str = self.data.get("date")
                date = datetime.strptime(date_str, "%Y-%m-%d").date()

                # Fetch lecture hall details
                lecture_hall = LectureHall.objects.get(id=hall_id)

                # Fetch occupied slots from FixedLecture and existing bookings
                occupied_slots = set(
                    FixedLecture.objects.filter(hall_id=hall_id, day=date.strftime('%A'))
                    .values_list("time_slot_id", flat=True)
                ) | set(
                    Booking.objects.filter(lecture_hall_id=hall_id, date=date)
                    .exclude(status="Rejected")
                    .values_list("time_slots", flat=True)  # Fix for ManyToManyField
                )

                # Available time slots
                self.fields["time_slots"].queryset = TimeSlot.objects.exclude(id__in=occupied_slots)

            except (ValueError, TypeError, LectureHall.DoesNotExist):
                self.fields["time_slots"].queryset = TimeSlot.objects.none()
        else:
            self.fields["time_slots"].queryset = TimeSlot.objects.none()

