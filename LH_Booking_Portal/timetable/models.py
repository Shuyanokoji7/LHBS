from django.db import models

class LectureHall(models.Model):
    name = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField(default=100)
    ac_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Price for AC
    non_ac_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Price for Non-AC
    projector_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Price for projector (if available)

    def __str__(self):
        return self.name

class TimeSlot(models.Model):
    """Represents a time slot (e.g., 08:00 - 08:30)"""
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"
    
class FixedLecture(models.Model):
    hall = models.ForeignKey(LectureHall, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    day = models.CharField(max_length=10)
    subject = models.CharField(max_length=100)

class OmittedDays(models.Model):
    day = models.CharField(max_length=10)
    
class WeeklySchedule(models.Model):
   
    lecture_hall = models.ForeignKey(LectureHall, on_delete=models.CASCADE)
    day = models.CharField(max_length=10)  # Monday, Tuesday, etc.
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100, null=True, blank=True)  # Optional

    def __str__(self):
        return f"{self.lecture_hall} - {self.day} - {self.time_slot}"
