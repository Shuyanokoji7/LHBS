import os
import pandas as pd
from django.core.management.base import BaseCommand
from timetable.models import LectureHall

# Define the folder where the CSV file is stored
CSV_FOLDER = r"C:\Users\yuta1\OneDrive\Desktop\DjangoYT\DATA"

class Command(BaseCommand):
    help = "Import lecture hall pricing and capacity data from CSV file"

    def handle(self, *args, **kwargs):
        """Main function to process the CSV files."""
        for filename in os.listdir(CSV_FOLDER):
            if filename.endswith(".csv"):
                file_path = os.path.join(CSV_FOLDER, filename)
                self.import_csv(file_path)

    def import_csv(self, file_path):
        """Reads the CSV file and updates/inserts LectureHall data."""
        self.stdout.write(f"📂 Importing {file_path}...")

        # Read CSV file
        df = pd.read_csv(file_path)

        # Loop through the CSV rows
        for _, row in df.iterrows():
            name = str(row["name"]).strip()
            capacity = int(row["capacity"])
            ac_price = float(row["ac_price"])
            non_ac_price = float(row["non_ac_price"])
            projector_price = float(row["projector_price"])

            # Update or create LectureHall entry
            hall, created = LectureHall.objects.update_or_create(
                name=name,
                defaults={
                    "capacity": capacity,
                    "ac_price": ac_price,
                    "non_ac_price": non_ac_price,
                    "projector_price": projector_price,
                }
            )

            if created:
                self.stdout.write(f"✅ Created new hall: {name}")
            else:
                self.stdout.write(f"🔄 Updated hall: {name}")

        self.stdout.write("🎯 Import complete!")