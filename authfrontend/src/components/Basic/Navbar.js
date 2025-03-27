import React from "react";
import "./Navbar.css"; // Import a CSS file for styling

const Navbar = () => {
  return (
    <div className="navbar">
      <button className="nav-item" onClick={() => window.location.href = "/register"}>Register</button>
      <button className="nav-item" onClick={() => window.location.href = "/booking-form"}>Booking Form</button>
      <button className="nav-item" onClick={() => window.location.href = "/pending-approvals"}>Pending Approvals</button>
      <button className="nav-item" onClick={() => window.location.href = "/lecture-halls"}>Lecture Halls</button>
      <button className="nav-item" onClick={() => window.location.href = "/login"}>Login</button>
      <button className="nav-item" onClick={() => window.location.href = "/history"}>History</button>
    </div>
  );
};

export default Navbar;