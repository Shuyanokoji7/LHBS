import React, { useEffect, useState } from "react";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"

const BookingHistoryList = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookingHistory = async () => {
            const token = localStorage.getItem("authToken");
            const userId = localStorage.getItem("userId");

            if (!token || !userId) {
                alert("User not authenticated. Please log in.");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/api/bookings/history/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user: userId }),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
                setError("Failed to fetch bookings.");
            }
        };
        fetchBookingHistory();
    }, []);

    const handleDownload = async (bookingId) => {
        try {
            const response = await fetch(`/api/generate-bill/${bookingId}/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to download bill");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `LHC_Bill_${bookingId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading bill:", error);
            alert("Failed to download bill. Please try again.");
        }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!bookings.length) return <p>You have no bookings.</p>;

    return (
        <div>
            <UserNavbar/>
            <Header/>
            <h2>Your Bookings</h2>
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
                        <th>Request Time</th>
                        <th>Actions</th>
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
                            <td>{new Date(booking.request_time).toLocaleString()}</td>
                            <td>
                                {booking.status === "Approved" && (
                                    <button
                                        onClick={() => handleDownload(booking.id)}
                                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Download Invoice
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookingHistoryList;