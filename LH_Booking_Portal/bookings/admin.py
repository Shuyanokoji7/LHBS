from django.apps import AppConfig
from django.contrib import admin
from .models import Booking


class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'lecture_hall', 'date', 'status', 'price')
    list_filter = ('status', 'date', 'lecture_hall')
    search_fields = ('user__username', 'lecture_hall__name', 'date')
    ordering = ('-date',)
    filter_horizontal = ('time_slots',)  # ManyToMany field for better UI
