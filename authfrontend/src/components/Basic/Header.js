import React from 'react';
import './Header.css';
import iitk_logo from '../User/lh_booking_images/iitk_logo.jpg';
import {logoutUser} from "../../api"
import { useNavigate } from "react-router-dom";


const Header = () => {
  // Logout function
  const navigate = useNavigate(); // Hook for redirection
  const handleLogout = async () => {
    try {
      await logoutUser(); // Logout user
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="header">
      <div className="logo-container">
        <img src={iitk_logo} alt="IIT-K Logo" className="logo" />
        <h1 className="title">IIT-K Lecture Hall Booking</h1>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Header;
