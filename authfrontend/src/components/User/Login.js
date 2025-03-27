import React, { useState } from "react";
import { loginUser } from "../../api";
import { useNavigate } from "react-router-dom";
import iitkLogo from "./lh_booking_images/iitk_logo.jpg";
import emailIcon from "./lh_booking_images/email.png";
import pwIcon from "./lh_booking_images/pw.png";
import hideIcon from "./lh_booking_images/hide.png";
import libraryImage from "./lh_booking_images/newcanvalib.png";
import "./login.css";

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginUser(formData); // API call to login

            if (data.token && data.user_id) {  // Ensure both token and user ID are received
                localStorage.setItem("authToken", data.token); // Store auth token
                localStorage.setItem("userId", data.user_id);  // Store user ID
                setAuth(true);
                alert("Login Successful!");
                navigate("/booking-form");
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.log("Login Error:", err.response?.data || err.message); // Debugging
            setError(err.response?.data?.error || "Login failed. Please try again.");
        }
    };


    return (
        <div className="login-container">
            <div className="campus-visual">
                <img src={libraryImage} alt="IIT Kanpur Campus" />
                <div className="campus-overlay">
                    <h1>Welcome to LHB Portal</h1>
                    <p>
                        Streamline your lecture hall booking experience with our intuitive
                        platform.
                    </p>
                </div>
            </div>
            <div className="login-form">
                <div className="logo-container">
                    <img src={iitkLogo} alt="IIT Kanpur Logo" className="logo" />
                    <span className="logo-text">IIT Kanpur</span>
                </div>
                <div className="form-content">
                    <div className="form-header">
                        <h2>Sign In</h2>
                        <p>Book lecture halls with ease</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            {<label htmlFor="username">Username</label>}
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="example@email.com"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    aria-label="Enter your email"
                                    style={{ letterSpacing: "0.09em" }}
                                />
                                <span className="input-icon">✉</span>
                            </div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    aria-label="Enter your password"
                                    style={{ letterSpacing: showPassword ? "0.09em" : "0.2em" }} // Ensure text and dots align
                                />
                                <span className="input-icon"><img
                                    src={showPassword ? hideIcon : pwIcon}
                                    alt="Toggle Password Visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: "pointer" }}
                                /></span>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button type="submit" className="Login" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                        <div className="forgot-password">
                            <a href="/forgot-password" style={{ fontSize: "17px", marginTop: "10px", color: "blue", textDecoration: "none" }}>Forgot Password?</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
