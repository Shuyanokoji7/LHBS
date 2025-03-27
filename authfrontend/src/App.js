import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Register from "./components/User/Register";
import Login from "./components/User/Login";
import Logout from "./components/User/Logout";
import ForgotPassword from "./components/User/ForgotPassword";
import ResetPassword from "./components/User/ResetPassword";
import LectureHalls from "./components/Timetable/LectureHalls";
import BookingForm from "./components/Booking/BookingForm";
// import LectureHallTimetable from './components/Timetable/LectureHallTimetable';
import PendingList from "./components/Booking/PendingList";
import BookingHistoryList from "./components/Booking/BookingHistory";
import LectureHallBookings from "./components/Timetable/DeleteBooking";


const App = () => {
    const [isAuthenticated, setAuth] = useState(!!localStorage.getItem("token"));

    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setAuth={setAuth} />} />
                <Route path="/logout" element={isAuthenticated ? <Logout setAuth={setAuth} /> : <Navigate to="/login" />} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/register" /> : <Navigate to="/login" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />      
                <Route path="/lecture-halls" element={<LectureHalls />} />
                <Route path="/history" element={<BookingHistoryList />} />
                <Route path="/booking-form" element={<BookingForm />} />
                {/* <Route path="/delete" element={<LectureHallBookings />} /> */}
                <Route path="/" element={<LectureHalls />} />
                {/* <Route path="/timetable/:hallId" element={<LectureHallTimetable />} /> */}
                <Route path="/pending-approvals" element={<PendingList />} /> 
            </Routes>
        </Router>
    );
};

export default App;
