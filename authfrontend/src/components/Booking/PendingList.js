import React, { useEffect, useState } from "react";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"

const PendingList = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    // Fetch pending bookings from the API
    useEffect(() => {
        const fetchPendingBookings = async () => {
            const token = localStorage.getItem("authToken");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                alert("User not authenticated. Please log in.");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/api/bookings/pending/", {
                    method: "POST", // Change to POST
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user: userId }), // Send user ID in body
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                console.log("Pending Bookings:", data);

                setBookings(data); // ✅ Update state with fetched data
            } catch (error) {
                console.error("Failed to fetch pending bookings:", error);
                setError("Failed to fetch pending bookings."); // ✅ Update error state
            }
        };
        fetchPendingBookings();
    }, []);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!bookings.length) return <p>You have no pending bookings.</p>;

    return (
        <div>
            <UserNavbar/>
            <Header/>
            <h2>Your Pending Bookings</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Lecture Hall</th>
                        <th>Date</th>
                        <th>Time Slots</th>
                        <th>Purpose</th>
                        <th>AC Required</th>
                        <th>Projector Required</th>
                        <th>Price</th>
                        <th>Booking Type</th>
                        <th>Status</th>
                        <th>Approvals</th>
                        <th>Request Time</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.lecture_hall_name}</td>
                            <td>{booking.date}</td>
                            <td>
                                {booking.time_slots.map((slot, index) => (
                                    <div key={`${booking.id}-slot-${index}`}>
                                        {slot.start_time} - {slot.end_time}
                                    </div>
                                ))}
                            </td>
                            <td>{booking.purpose}</td>
                            <td>{booking.ac_required ? "Yes" : "No"}</td>
                            <td>{booking.projector_required ? "Yes" : "No"}</td>
                            <td>₹{booking.price}</td>
                            <td>{booking.booking_type}</td>
                            <td>{booking.status}</td>
                            <td>
                                <ul>
                                    {Object.entries(booking.approvals_pending).map(([authority, isApproved]) => (
                                        <li key={`${booking.id}-${authority}`}>
                                            {authority}: {isApproved ? "✅ Approved" : "⏳ Pending"}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>{new Date(booking.request_time).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PendingList;
