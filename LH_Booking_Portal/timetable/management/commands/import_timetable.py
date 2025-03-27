import os
import pandas as pd
from django.core.management.base import BaseCommand
from timetable.models import LectureHall, FixedLecture, TimeSlot

# Path to folder where CSV files are stored
CSV_FOLDER = r"C:\Users\yuta1\OneDrive\Desktop\DjangoYT\LH_Booking_Portal\timetable_data"

class Command(BaseCommand):
    help = "Import timetables from multiple CSV files"

    def handle(self, *args, **kwargs):
        """Main function to loop through CSV files and import data."""
        # 🚀 Remove all existing FixedLectures before re-importing
        FixedLecture.objects.all().delete()
        print("✅ Cleared all existing FixedLectures!")

        for filename in os.listdir(CSV_FOLDER):
            if filename.endswith(".csv"):
                file_path = os.path.join(CSV_FOLDER, filename)
                self.import_csv(file_path)

    def import_csv(self, file_path):
        """Reads a CSV file and imports its data into the database."""
        self.stdout.write(f"📂 Importing {file_path}...")

        # Extract Lecture Hall name from the filename (e.g., "L-1.csv" -> "L-1")
        lecture_hall_name = os.path.basename(file_path).split('.')[0]

        # Get or create LectureHall entry
        hall, _ = LectureHall.objects.get_or_create(name=lecture_hall_name)

        # Read CSV file
        df = pd.read_csv(file_path)

        # Loop through the rows (each time slot)
        for index, row in df.iterrows():
            time_str = row[0]  # First column contains time (e.g., "08:00-08:30")
            start_time, end_time = [t.strip() for t in time_str.split('-')]

            # Get or create the TimeSlot
            time_slot, _ = TimeSlot.objects.get_or_create(start_time=start_time, end_time=end_time)

            # Loop through the columns (each day)
            for col_name in df.columns[1:]:  # Skipping the first column (time)
                day = col_name.strip()
                subject = str(row[col_name]).strip() if pd.notna(row[col_name]) else None  # Convert to string & strip spaces

                if subject in ["", "-", "nan", None]:  
                    continue  # 🚀 Skip empty subjects (prevents false bookings)

                print(f"✅ Saving: Hall={hall.name}, Day={day}, Time={start_time}-{end_time}, Subject={subject}")

                FixedLecture.objects.update_or_create(
                    hall=hall,
                    day=day,
                    time_slot=time_slot,
                    defaults={'subject': subject},
                )

        self.stdout.write(f"✅ {lecture_hall_name} imported successfully!")