import React, { useEffect, useState } from "react";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"
import { fetchBookingHistory } from "../../api";
import { downloadBill } from "../../api";

const BookingHistoryList = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await fetchBookingHistory();
                setBookings(data);
            } catch (error) {
                setError(error.error || "Failed to fetch bookings.");
            }
        };
    
        fetchHistory();
    
    }, []);

    const handleDownload = async (bookingId) => {
        try {
            const blob = await downloadBill(bookingId); // Get the blob from API
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = `LHC_Bill_${bookingId}.pdf`;
            document.body.appendChild(a);
            a.click();
    
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error.message);
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