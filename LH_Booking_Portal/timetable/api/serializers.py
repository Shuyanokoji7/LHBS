from rest_framework import serializers
from ..models import LectureHall, TimeSlot, FixedLecture, WeeklySchedule

class LectureHallSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureHall
        fields = ["id", "name", "capacity", "ac_price", "non_ac_price", "projector_price"]

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["id", "start_time", "end_time"]

class FixedLectureSerializer(serializers.ModelSerializer):
    hall = LectureHallSerializer()
    time_slot = TimeSlotSerializer()

    class Meta:
        model = FixedLecture
        fields = ["id", "hall", "time_slot", "day", "subject"]

class WeeklyScheduleSerializer(serializers.ModelSerializer):
    lecture_hall = LectureHallSerializer()
    time_slot = TimeSlotSerializer()

    class Meta:
        model = WeeklySchedule
        fields = ["id", "lecture_hall", "day", "time_slot", "subject"]
