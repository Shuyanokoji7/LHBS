import React, { useEffect, useState } from "react";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"
import { getPendingApprovals } from "../../api";

const PendingList = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingBookings = async () => {
            try {
                const data = await getPendingApprovals(); // Call API function
                console.log("Pending Bookings:", data);
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch pending bookings:", error);
                setError(error.error || "Failed to fetch pending bookings.");
            }
        };

        fetchPendingBookings();
    }, []);
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!bookings.length) return <p>No pending bookings.</p>;

    return (
        <div>
            <UserNavbar />
            <Header />
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
                                {booking.time_slots_details.map((slot, index) => (
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
