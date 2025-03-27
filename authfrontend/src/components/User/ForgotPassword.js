import React, { useState } from "react";
import { requestPasswordReset } from "../../api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await requestPasswordReset(email);
            setMessage("Password reset link has been sent to your email.");
            setError("");
        } catch (err) {
            setError("Failed to send reset email. Please try again.");
            setMessage("");
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
