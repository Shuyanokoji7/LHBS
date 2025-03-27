// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import HNavbar from "../Basic/HorNavBar";

// const LectureHalls = () => {
//     const [lectureHalls, setLectureHalls] = useState([]);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         axios.get("http://127.0.0.1:8000/api/timetable/lecture-halls/")
//             .then((response) => setLectureHalls(response.data))
//             .catch((err) => setError("Error fetching lecture halls"));
//     }, []);

//     return (
//         <div>
//             <HNavbar />
//             <h1>Available Lecture Halls</h1>
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             {lectureHalls.length > 0 ? (
//                 <ul>
//                     {lectureHalls.map((hall) => (
//                         <li key={hall.id}>
//                             <Link to={`/timetable/${hall.id}`}>{hall.name}</Link>
//                         </li>
//                     ))}
//                 </ul>
//             ) : (
//                 <p>No lecture halls available.</p>
//             )}
//         </div>
//     );
// };

// export default LectureHalls;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"

const LectureHallTimetable = () => {
    const { hallId: paramHallId } = useParams();
    const [halls, setHalls] = useState([]);
    const [hallId, setHallId] = useState(paramHallId || ""); // Default empty selection
    const [selectedDate, setSelectedDate] = useState("");
    const [timetable, setTimetable] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch available lecture halls
        axios.get("http://127.0.0.1:8000/api/timetable/lecture-halls/")
            .then((response) => setHalls(response.data))
            .catch(() => setError("Error fetching lecture halls"));
    }, []);

    useEffect(() => {
        if (!hallId || !selectedDate) return; // Fetch only when both are selected

        axios.get(`http://127.0.0.1:8000/api/timetable/${hallId}/?date=${selectedDate}`)
            .then((response) => {
                setTimetable(response.data);
                console.log("Timetable Data:", response.data);
            })
            .catch(() => setError("Error fetching timetable"));
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
