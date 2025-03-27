import { useEffect, useState, useCallback } from "react";
import { fetchLectureHalls, fetchAvailableSlots, submitBooking } from "../../api"; // Ensure correct imports
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"

// Navbar()
const BookingForm = () => {
  const [lectureHalls, setLectureHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [acRequired, setAcRequired] = useState(false); // Default to false
  const [projectorRequired, setProjectorRequired] = useState(false); // Default to false
  const [bookingType, setBookingType] = useState("non-academic"); // Default to non-academic
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch lecture halls on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchLectureHalls();
        setLectureHalls(data);
      } catch (error) {
        console.error("Error fetching lecture halls:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch available slots when hall & date are selected
  const fetchSlots = useCallback(async () => {
    if (selectedHall && date) {
      try {
        const slots = await fetchAvailableSlots(selectedHall, date);
        setAvailableSlots(Array.isArray(slots) ? slots : []);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setAvailableSlots([]);
      }
    }
  }, [selectedHall, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Handle slot selection
  const handleSlotChange = (slotId) => {
    setSelectedSlots((prevSlots) =>
      prevSlots.includes(slotId)
        ? prevSlots.filter((id) => id !== slotId)
        : [...prevSlots, slotId]
    );
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error state

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("User not authenticated. Please log in.");
      return;
    }

    if (!selectedHall || !date || selectedSlots.length === 0 || !purpose) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const bookingData = {
      user: userId,
      lecture_hall: selectedHall,
      date,
      purpose,
      time_slots: selectedSlots,
      ac_required: acRequired, // Will be false if not selected
      projector_required: projectorRequired, // Will be false if not selected
      booking_type: bookingType // Include the booking type here
    };

    try {
      await submitBooking(bookingData);
      console.log(bookingData);
      alert("Booking successful!");
      // Reset form after success
      setSelectedHall("");
      setDate("");
      setPurpose("");
      setSelectedSlots([]);
      setAcRequired(false); // Reset to false
      setProjectorRequired(false); // Reset to false
      setBookingType("non-academic"); // Reset booking type to default
    } catch (error) {
      console.log(bookingData);
      console.error("Booking failed:", error.response?.data || error.message);
      // Display the message from the backend, if available
      const errorMessage = error?.response?.data?.message || error?.message || "Booking failed. Please try again.";
      console.error("Booking failed:", errorMessage); // Log error message
      setErrorMessage(errorMessage); // Optionally, also set it in the error state for displaying in the UI
      alert(errorMessage); // Show the message to the user
    }

  };

  return (
    <div>
      <UserNavbar />
      <Header />
      <h2>Book a Lecture Hall</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Lecture Hall:</label>
          <select value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)} required>
            <option value="">Select a hall</option>
            {lectureHalls.map((hall) => (
              <option key={hall.id} value={hall.id}>{hall.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Select Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <label>Purpose of Booking:</label>
          <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows="3" required></textarea>
        </div>

        <div>
          <label>Select Time Slots:</label>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <div key={slot.id}>
                <input
                  type="checkbox"
                  checked={selectedSlots.includes(slot.id)}
                  onChange={() => handleSlotChange(slot.id)}
                />
                <label>{`${slot.start_time} - ${slot.end_time}`}</label>
              </div>
            ))
          ) : (
            <p>No slots available. Choose a different hall or date.</p>
          )}
        </div>

        <div>
          <label>AC Required:</label>
          <input type="checkbox" checked={acRequired} onChange={() => setAcRequired(!acRequired)} />
        </div>

        <div>
          <label>Projector Required:</label>
          <input type="checkbox" checked={projectorRequired} onChange={() => setProjectorRequired(!projectorRequired)} />
        </div>

        <div>
          <label>Booking Type:</label>
          <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} required>
            <option value="academic">Academic</option>
            <option value="non-academic">Non-Academic</option>
          </select>
        </div>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <button type="submit">Submit Booking</button>
      </form>
    </div>
  );
};

export default BookingForm;
