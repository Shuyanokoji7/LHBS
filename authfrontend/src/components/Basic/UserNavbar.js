import React from 'react';
import './UserNavbar.css';

const UserNavbar = ({ onNavigate, currentPath }) => {
  // Map of navigation items to their respective routes
  const navItems = [
    { name: 'New', path: '/booking-form' },
    { name: 'Live Schedule', path: '/lecture-halls' },
    { name: 'History', path: '/history' }, // Changed from '/' to '/history'
    { name: 'Status', path: '/pending-approvals' },
    { name: 'Feedback', path: '/feedback' },
    { name: 'Help', path: '/help' },
  ];

  return (
    <div className="user-navbar">
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => onNavigate(item.path)}
          className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
        >
          {item.name}
          {item.name === 'New' && <span className="info-icon">ⓘ</span>}
        </button>
      ))}
    </div>
  );
};

export default UserNavbar;
