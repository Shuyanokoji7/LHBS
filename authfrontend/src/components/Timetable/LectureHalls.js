import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"
import { fetchLectureHalls } from "../../api";
import { fetchTimetable } from "../../api";

const LectureHallTimetable = () => {
    const { hallId: paramHallId } = useParams();
    const [halls, setHalls] = useState([]);
    const [hallId, setHallId] = useState(paramHallId || ""); // Default empty selection
    const [selectedDate, setSelectedDate] = useState("");
    const [timetable, setTimetable] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getLectureHalls = async () => {
            try {
                const data = await fetchLectureHalls();
                setHalls(data);
            } catch (error) {
                console.error("Error fetching lecture halls:", error);
                setError(error.error || "Failed to fetch lecture halls.");
            }
        };
    
        getLectureHalls();
    }, []);

    useEffect(() => {
        if (!hallId || !selectedDate) return; // Fetch only when both hallId and selectedDate are selected
    
        const getTimetable = async () => {
            try {
                const data = await fetchTimetable(hallId, selectedDate);
                setTimetable(data);  
                console.log("Timetable Data:", data);
            } catch (error) {
                console.error("Error fetching timetable:", error);
                setError(error.error || "Failed to fetch timetable");  // Update the error state
            }
        };
    
        getTimetable();  // Fetch the timetable
    }, [hallId, selectedDate]); 

    const timeSlots = timetable 
        ? Array.from(new Set(
            Object.values(timetable.schedule).flatMap(daySlots => 
                daySlots.map(slot => slot.time_slot.start_time + " - " + slot.time_slot.end_time)
            )
        )).sort()
        : [];

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div>
            <UserNavbar />
            <Header />
            <h1>Lecture Hall Timetable</h1>

            {/* Unified Selection */}
            <div>
                <label>Lecture Hall:</label>
                <select value={hallId} onChange={(e) => setHallId(e.target.value)}>
                    <option value="">Select Hall</option>
                    {halls.map((hall) => (
                        <option key={hall.id} value={hall.id}>{hall.name}</option>
                    ))}
                </select>

                <label>Date:</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            {/* Error Handling */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!timetable && hallId && selectedDate && <p>Loading...</p>}

            {/* Timetable Table */}
            {timetable && (
                <div>
                    <h2>Schedule for {timetable.hall.name} on {selectedDate}</h2>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Time Slot</th>
                                {daysOfWeek.map((day) => <th key={day}>{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((time, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{time}</td>
                                    {daysOfWeek.map((day, colIndex) => {
                                        const slots = timetable.schedule[day] || [];
                                        const slotEntry = slots.find(slot => 
                                            (slot.time_slot.start_time + " - " + slot.time_slot.end_time) === time
                                        );

                                        return (
                                            <td key={colIndex} style={{ textAlign: "center" }}>
                                                {slotEntry
                                                    ? slotEntry.approved_booking
                                                        ? slotEntry.approved_booking.purpose
                                                        : slotEntry.subject || "Available"
                                                    : "No Slot"
                                                }
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LectureHallTimetable;
