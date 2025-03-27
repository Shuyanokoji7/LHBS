import React, { useState, useEffect } from "react";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"
import { searchBookings, deleteBooking, fetchLectureHalls, fetchUsers } from "../../api";

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [lectureHalls, setLectureHalls] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedHall, setSelectedHall] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    // Fetch lecture halls and users on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const hallsData = await fetchLectureHalls();
                setLectureHalls(hallsData);
                const usersData = await fetchUsers();
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch bookings when filters change
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await searchBookings(selectedHall, selectedUser);
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };
        fetchBookings();
    }, [selectedHall, selectedUser]);

    // Delete booking
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;
        try {
            await deleteBooking(id);
            setBookings(bookings.filter((booking) => booking.id !== id));
            alert("Booking deleted successfully!");
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    return (
        <div>
            <UserNavbar />
            <Header />
            <h2>Search & Manage Bookings</h2>

            {/* Filter by Lecture Hall */}
            <select value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)}>
                <option value="">All Lecture Halls</option>
                {lectureHalls.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                        {hall.name}
                    </option>
                ))}
            </select>

            {/* Filter by User */}
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">All Users</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.username}
                    </option>
                ))}
            </select>

            {/* Bookings List */}
            <ul>
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <li key={booking.id}>
                            <strong>{booking.user.username}</strong> - {booking.lecture_hall_name} - {booking.date} - {booking.purpose}
                            <button onClick={() => handleDelete(booking.id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No future bookings found.</p>
                )}
            </ul>
        </div>
    );
};

export default Bookings;
