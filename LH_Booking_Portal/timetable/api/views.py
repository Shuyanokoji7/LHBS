from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user.api.permissions import IsAdmin, IsFaculty, IsStudent 
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from timetable.models import LectureHall, TimeSlot, FixedLecture
from bookings.models import Booking
from .serializers import LectureHallSerializer, TimeSlotSerializer, FixedLectureSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([AllowAny])
def LectureHallAPIView(request):

    lecture_halls = LectureHall.objects.all()
    serializer = LectureHallSerializer(lecture_halls, many=True)
    return Response(serializer.data)


class TimetableAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, hall_id):
        hall = get_object_or_404(LectureHall, id=hall_id)

        # Get selected date (default to today)
        selected_date_str = request.GET.get("date")
        if selected_date_str:
            try:
                selected_date = datetime.strptime(selected_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        else:
            selected_date = datetime.today().date()

        # Get start (Monday) and end (Sunday) of the selected week
        start_of_week = selected_date - timedelta(days=selected_date.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        # Fetch time slots
        time_slots = TimeSlot.objects.all().order_by("start_time")

        # Fetch fixed lectures & bookings
        fixed_lectures = FixedLecture.objects.filter(hall=hall)
        bookings = Booking.objects.filter(
            lecture_hall=hall,
            date__range=[start_of_week, end_of_week]
        ).exclude(status="Rejected")

        # **Optimize Fixed Lecture Lookup**
        fixed_lecture_dict = {(fl.day, fl.time_slot.id): fl for fl in fixed_lectures}

        # **Optimize Bookings Lookup**
        booking_dict = {}
        for booking in bookings:
            for time_slot in booking.time_slots.all():
                key = (booking.date, time_slot.id)
                booking_dict.setdefault(key, []).append(booking)

        # **Construct Schedule**
        schedule = {}
        for day_offset in range(7):  # Monday to Sunday
            date = start_of_week + timedelta(days=day_offset)
            weekday = date.strftime("%A")

            schedule[weekday] = []
            for time_slot in time_slots:
                lecture = fixed_lecture_dict.get((weekday, time_slot.id))
                slot_bookings = booking_dict.get((date, time_slot.id), [])

                # **Find Approved Booking**
                approved_booking = next((b for b in slot_bookings if b.status == "Approved"), None)

                # **Find Pending Bookings**
                pending_bookings = []
                if request.user.is_authenticated:  # ✅ Handle unauthenticated users
                    for b in slot_bookings:
                        if b.status == "Pending" and b.user == request.user:
                            remaining_authorities = [email for email, approved in b.approvals_pending.items() if not approved]
                            pending_bookings.append({
                                "booking_id": b.id,
                                "remaining_authority": remaining_authorities[0] if remaining_authorities else "Waiting for final approval"
                            })
                
                # **Timetable Entry**
                entry = {
                    "date": date.strftime("%Y-%m-%d"),
                    "time_slot": TimeSlotSerializer(time_slot).data,
                    "subject": (
                        approved_booking.purpose 
                        if approved_booking else (lecture.subject if lecture else None)
                    ),  # ✅ Show booking purpose if approved
                    "approved_booking": {
                        "booking_id": approved_booking.id if approved_booking else None,
                        "user": approved_booking.user.username if approved_booking else None,
                        "purpose": approved_booking.purpose if approved_booking else None,  # ✅ Include purpose explicitly
                    } if approved_booking else None,
                    "pending_bookings": pending_bookings,
                }
                schedule[weekday].append(entry)

        return Response({
            "hall": LectureHallSerializer(hall).data,
            "schedule": schedule,
            "selected_date": selected_date.strftime("%Y-%m-%d"),
        }, status=200)



class AllBookingsAPIView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, hall_id):
        hall = get_object_or_404(LectureHall, id=hall_id)

        # Get selected date (default to today)
        selected_date_str = request.GET.get("date")
        if selected_date_str:
            try:
                selected_date = datetime.strptime(selected_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
        else:
            selected_date = datetime.today().date()

        # Get start (Monday) and end (Sunday) of the selected week
        start_of_week = selected_date - timedelta(days=selected_date.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        # Fetch time slots
        time_slots = TimeSlot.objects.all().order_by("start_time")

        # Fetch bookings
        bookings = Booking.objects.filter(
            lecture_hall=hall,
            date__range=[start_of_week, end_of_week]
        ).exclude(status="Rejected")


        # **Optimize Bookings Lookup**
        booking_dict = {}
        for booking in bookings:
            for time_slot in booking.time_slots.all():
                key = (booking.date, time_slot.id)
                booking_dict.setdefault(key, []).append(booking)

        # **Construct Schedule**
        schedule = {}
        for day_offset in range(7):  # Monday to Sunday
            date = start_of_week + timedelta(days=day_offset)
            weekday = date.strftime("%A")

            schedule[weekday] = []
            for time_slot in time_slots:
                slot_bookings = booking_dict.get((date, time_slot.id), [])

                # **Find Approved Booking**
                approved_booking = next((b for b in slot_bookings if b.status == "Approved"), None)

                # **Find Pending Bookings**
                pending_bookings = []
                if request.user.is_authenticated:  # ✅ Handle unauthenticated users
                    for b in slot_bookings:
                        if b.status == "Pending" and b.user == request.user:
                            remaining_authorities = [email for email, approved in b.approvals_pending.items() if not approved]
                            pending_bookings.append({
                                "booking_id": b.id,
                                "remaining_authority": remaining_authorities[0] if remaining_authorities else "Waiting for final approval"
                            })
                
                # **Timetable Entry**
                entry = {
                    "date": date.strftime("%Y-%m-%d"),
                    "time_slot": TimeSlotSerializer(time_slot).data,
                    "subject": (
                        approved_booking.purpose 
                        if approved_booking else None
                    ),  # ✅ Show booking purpose if approved
                    "approved_booking": {
                        "booking_id": approved_booking.id if approved_booking else None,
                        "user": approved_booking.user.username if approved_booking else None,
                        "purpose": approved_booking.purpose if approved_booking else None,  # ✅ Include purpose explicitly
                    } if approved_booking else None,
                    "pending_bookings": pending_bookings,
                }
                schedule[weekday].append(entry)

        return Response({
            "hall": LectureHallSerializer(hall).data,
            "schedule": schedule,
            "selected_date": selected_date.strftime("%Y-%m-%d"),
        }, status=200)

