// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// // import Navbar from "../Basic/Navbar";
// // import HNavbar from "../Basic/HNavBar";

// const LectureHallBookings = () => {
//     const { hallId: paramHallId } = useParams();
//     const [halls, setHalls] = useState([]);
//     const [hallId, setHallId] = useState(paramHallId || ""); // Default empty selection
//     const [selectedDate, setSelectedDate] = useState("");
//     const [timetable, setTimetable] = useState(null);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         // Fetch available lecture halls
//         axios.get("http://127.0.0.1:8000/api/timetable/lecture-halls/")
//             .then((response) => setHalls(response.data))
//             .catch(() => setError("Error fetching lecture halls"));
//     }, []);

//     useEffect(() => {
//         if (!hallId || !selectedDate) return; // Fetch only when both are selected

//         axios.get(`http://127.0.0.1:8000/api/timetable/bookings/${hallId}/?date=${selectedDate}`)
//             .then((response) => {
//                 setTimetable(response.data);
//                 console.log("Timetable Data:", response.data);
//             })
//             .catch(() => setError("Error fetching timetable"));
//     }, [hallId, selectedDate]);

//     const handleDelete = async (bookingId) => {
//         if (!window.confirm("Are you sure you want to delete this booking?")) return;

//         try {
//             await axios.delete(`http://127.0.0.1:8000/api/bookings/${bookingId}/`);
//             alert("Booking deleted successfully!");
//             setTimetable((prevTimetable) => {
//                 // Remove the deleted booking
//                 const newSchedule = { ...prevTimetable.schedule };
//                 Object.keys(newSchedule).forEach(day => {
//                     newSchedule[day] = newSchedule[day].filter(slot => slot.id !== bookingId);
//                 });
//                 return { ...prevTimetable, schedule: newSchedule };
//             });
//         } catch (error) {
//             alert("Error deleting booking!");
//         }
//     };

//     const timeSlots = timetable
//         ? Array.from(new Set(
//             Object.values(timetable.schedule).flatMap(daySlots =>
//                 daySlots.map(slot => slot.time_slot.start_time + " - " + slot.time_slot.end_time)
//             )
//         )).sort()
//         : [];

//     const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

//     return (
//         <div>
//             {/* <Navbar />
//             <HNavbar /> */}
//             <h1>Lecture Hall Timetable</h1>

//             {/* Unified Selection */}
//             <div>
//                 <label>Lecture Hall:</label>
//                 <select value={hallId} onChange={(e) => setHallId(e.target.value)}>
//                     <option value="">Select Hall</option>
//                     {halls.map((hall) => (
//                         <option key={hall.id} value={hall.id}>{hall.name}</option>
//                     ))}
//                 </select>

//                 <label>Date:</label>
//                 <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
//             </div>

//             {/* Error Handling */}
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             {!timetable && hallId && selectedDate && <p>Loading...</p>}

//             {/* Timetable Table */}
//             {timetable && (
//                 <div>
//                     <h2>Schedule for {timetable.hall.name} on {selectedDate}</h2>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Time Slot</th>
//                                 {daysOfWeek.map((day) => <th key={day}>{day}</th>)}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {timeSlots.map((time, rowIndex) => (
//                                 <tr key={rowIndex}>
//                                     <td>{time}</td>
//                                     {daysOfWeek.map((day, colIndex) => {
//                                         const slots = timetable.schedule[day] || [];
//                                         const slotEntry = slots.find(slot =>
//                                             (slot.time_slot.start_time + " - " + slot.time_slot.end_time) === time
//                                         );

//                                         // Debugging: Log the slotEntry object
//                                         console.log(slotEntry);

//                                         return (
//                                             <td key={colIndex} style={{ textAlign: "center" }}>
//                                                 {slotEntry ? (
//                                                     <div>
//                                                         {/* Show User and Purpose */}
//                                                         <p><strong>{slotEntry.user?.username || "Unknown User"}</strong></p>
//                                                         <p>{slotEntry.purpose}</p>

//                                                         {/* Delete button */}
//                                                         <button
//                                                             onClick={() => handleDelete(slotEntry.id)}
//                                                             style={{
//                                                                 backgroundColor: slotEntry.approved_booking ? "#4CAF50" : "#FFA500",
//                                                                 color: "white",
//                                                                 border: "none",
//                                                                 padding: "5px 10px",
//                                                                 cursor: "pointer",
//                                                                 borderRadius: "5px"
//                                                             }}
//                                                         >
//                                                             Delete
//                                                         </button>
//                                                     </div>
//                                                 ) : "Available"}
//                                             </td>
//                                         );
//                                     })}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default LectureHallBookings;
