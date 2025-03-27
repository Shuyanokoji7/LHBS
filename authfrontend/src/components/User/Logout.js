import React from "react";
import { logoutUser } from "../../api";

const Logout = ({ setAuth }) => {
    const handleLogout = async () => {
        await logoutUser();
        setAuth(false);
        alert("Logged out successfully!");
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
