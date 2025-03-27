import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api";
import iitkLogo from "./lh_booking_images/iitk_logo.jpg";
import libraryImage from "./lh_booking_images/newcanvalib.png";
// import "./login.css";

const ResetPassword = () => {
    const { userId, token } = useParams();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await resetPassword(userId, token, password);
            setMessage("Password reset successful! Redirecting to login...");
            setError("");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError("Password reset failed.");
            setMessage("");
        }
    };

    return (
        <div className="body">
            <div className="container">
                {/* Header */}
                <div className="header">
                    <div className="iitk-img">
                        <img src={iitkLogo} alt="IITK Logo" />
                    </div>
                    <div className="img-tag">
                        <h3>IIT Kanpur</h3>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main">
                    /*<div className="content">
                        <div className="small"><p>Book lecture hall</p></div>
                        <div className="big"><h5>Sign In to LHB Portal</h5></div>
                    </div>

                    {/* Form */}
                    <div className="form-container">
                        <h2>Reset Password</h2>
                        {message && <p style={{ color: "green" }}>{message}</p>}
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <input type="password" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} required />
                            <button type="submit">Reset Password</button>
                        </form>
                        <div>
                            <a href="/forgot-password" style={{ fontSize: "17px", marginTop: "10px", color: "blue", textDecoration: "none" }}>Forgot Password?</a>
                        </div>
                    </div>
                </div>

                {/* Right Column Image */}
                <div className="right-col">
                    <img src={libraryImage} alt="Library" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

