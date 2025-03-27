from django.urls import path
from .views import TimetableAPIView, LectureHallAPIView, AllBookingsAPIView # ✅ Import API view

urlpatterns = [
    path("lecture-halls/", LectureHallAPIView, name="lecture_hall_api"),
    path("<int:hall_id>/", TimetableAPIView.as_view(), name="timetable_api"),  # ✅ Use `.as_view()` for class-based views
    path("bookings/<int:hall_id>/", AllBookingsAPIView.as_view(), name="bookings_api"),  # ✅ Use `.as_view()` for class-based views
]
