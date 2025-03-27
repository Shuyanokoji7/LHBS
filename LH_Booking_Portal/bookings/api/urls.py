from django.urls import path
from .views import BookingCreateAPIView, ApproveBookingAPIView, SearchBookingAPIView, GenerateBillAPIView, RejectBookingAPIView, AvailableSlotsAPIView, PendingApprovalsAPIView, BookingHistoryAPIView, DeleteBookingAPIView

app_name = "bookings"  

urlpatterns = [
    path("create/", BookingCreateAPIView.as_view(), name="booking-create"),
    path('available-slots/', AvailableSlotsAPIView.as_view(), name='available-slots'),
    path("approve/", ApproveBookingAPIView.as_view(), name="approve-booking"),
    path('delete/<int:booking_id>/', DeleteBookingAPIView.as_view(), name='delete-booking'),
    path('search/', SearchBookingAPIView.as_view(), name='search-booking'),
    path("reject/", RejectBookingAPIView.as_view(), name="reject-booking"),
    path("history/", BookingHistoryAPIView.as_view(), name="booking-history"),
    path('generate-bill/<int:booking_id>/', GenerateBillAPIView.as_view(), name='generate-bill'),
    path("pending/", PendingApprovalsAPIView.as_view(), name="pending-approval"),
    
]
