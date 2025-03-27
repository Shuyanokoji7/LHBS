from rest_framework import serializers
from bookings.models import Booking
from timetable.models import TimeSlot, LectureHall


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["id", "start_time", "end_time"]


class BookingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')  # Read-only user field
    time_slots = TimeSlotSerializer(many=True, read_only=True)  # ✅ Nested serializer
    lecture_hall_name = serializers.CharField(source="lecture_hall.name", read_only=True)
    lecture_hall = serializers.PrimaryKeyRelatedField(queryset=LectureHall.objects.all())
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    lecture_hall_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'

    def get_lecture_hall_name(self, obj):
        """Fetch the name of the lecture hall instead of just the ID."""
        return obj.lecture_hall.name if obj.lecture_hall else None
    
    def validate(self, data):
        """Custom validation to check for conflicting bookings."""
        lecture_hall = data['lecture_hall']
        date = data['date']
        time_slots = data['time_slots']

        conflicting_bookings = Booking.objects.filter(
            lecture_hall=lecture_hall,
            date=date,
            time_slots__in=time_slots,
            status='Approved'
        ).values_list("id", flat=True).distinct()

        if conflicting_bookings:
            raise serializers.ValidationError("Selected time slots are already booked.")

        return data

    def create(self, validated_data):

        time_slots = validated_data.pop('time_slots') 
        booking = Booking.objects.create(**validated_data)  
        booking.time_slots.set(time_slots)  
        booking.price = booking.calculate_price() 
        booking.save()
        return booking
