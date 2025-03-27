from django.urls import path
from .views import BookingCreateAPIView, ApproveBookingAPIView, GenerateBillAPIView, RejectBookingAPIView, AvailableSlotsAPIView, PendingApprovalsAPIView, BookingHistoryAPIView, DeleteBookingAPIView

app_name = "bookings"  

urlpatterns = [
    path("create/", BookingCreateAPIView.as_view(), name="booking-create"),
    path('available-slots/', AvailableSlotsAPIView.as_view(), name='available-slots'),
    path("approve/", ApproveBookingAPIView.as_view(), name="approve-booking"),
    path('delete/<int:booking_id>/', DeleteBookingAPIView.as_view(), name='delete-booking'),
    path("reject/", RejectBookingAPIView.as_view(), name="reject-booking"),
    path("history/", BookingHistoryAPIView.as_view(), name="booking-history"),
    path('api/generate-bill/<int:booking_id>/', GenerateBillAPIView.as_view(), name='generate-bill'),
    # path("success/", BookingSuccessAPIView.as_view(), name="booking_success"),
    path("pending/", PendingApprovalsAPIView.as_view(), name="pending-approval"),
]
