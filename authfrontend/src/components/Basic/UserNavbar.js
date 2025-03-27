import React from "react";
import { NavLink } from "react-router-dom";
import "./UserNavbar.css";

const UserNavbar = () => {
  const role = localStorage.getItem("role"); // Get user role

  const navItems = [
    { name: "New Booking", path: "/booking-form", allowedRoles: ["student", "faculty", "admin"] },
    { name: "Live Schedule", path: "/lecture-halls", allowedRoles: ["everyone"] }, // Accessible to all
    { name: "History", path: "/history", allowedRoles: ["student", "faculty"] },
    { name: "Pending Approvals", path: "/pending-approvals", allowedRoles: ["student", "faculty"] }, // Only admin can access
    { name: "Register User", path: "/register", allowedRoles: ["admin"] }, // Only admin can register users
    { name: "Search Bookings", path: "/search", allowedRoles: ["admin"] }, // Only admin can register users
  ];

  return (
    <div className="user-navbar">
      {navItems.map((item) => {
        const isDisabled = item.allowedRoles.includes("everyone") ? false : !item.allowedRoles.includes(role);

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
            aria-disabled={isDisabled}
            onClick={(e) => isDisabled && e.preventDefault()} // Prevent navigation if disabled
          >
            {item.name}
          </NavLink>
        );
      })}
    </div>
  );
};

export default UserNavbar;
