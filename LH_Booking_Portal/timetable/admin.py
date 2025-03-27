from django.apps import AppConfig
from django.contrib import admin
from .models import LectureHall, TimeSlot, FixedLecture, OmittedDays, WeeklySchedule

class TimetableConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'timetable'

@admin.register(LectureHall)
class LectureHallAdmin(admin.ModelAdmin):
    list_display = ("name", "capacity", "ac_price", "non_ac_price", "projector_price")
    search_fields = ("name",)
    ordering = ("name",)

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ("start_time", "end_time")
    ordering = ("start_time",)

@admin.register(FixedLecture)
class FixedLectureAdmin(admin.ModelAdmin):
    list_display = ("hall", "day", "time_slot", "subject")
    list_filter = ("day", "hall")

@admin.register(OmittedDays)
class OmittedDaysAdmin(admin.ModelAdmin):
    list_display = ("day",)

@admin.register(WeeklySchedule)
class WeeklyScheduleAdmin(admin.ModelAdmin):
    list_display = ("lecture_hall", "day", "time_slot", "subject")
    list_filter = ("day", "lecture_hall")

