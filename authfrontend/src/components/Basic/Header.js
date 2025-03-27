import React from 'react';
import './Header.css';
import iitk_logo from '../User/lh_booking_images/iitk_logo.jpg';
import axios from 'axios'; // Make sure axios is imported

const Header = () => {
  // Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`http://127.0.0.1:8000/api/user/logout/`, {}, {
          headers: { Authorization: `Token ${token}` },
        });
        localStorage.removeItem("token"); // Remove token after successful logout
        // Redirect to login page after logout
        window.location.href = '/login';
      } else {
        console.error('No token found in localStorage');
      }
    } catch (error) {
      console.error('Error during logout', error.response?.data || error.message);
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
