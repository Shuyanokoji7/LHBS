import axios from "axios";

// Register User
export const registerUser = async (userData) => {
    console.log("Sending user data:", userData);
    try {
        const response = await axios.post(`http://127.0.0.1:8000/api/user/register/`, userData, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("API Response:", response);
        return response.data;
    } catch (err) {
        console.log("Registration Error:", err.response?.data || err.message);
        throw err.response?.data || { error: "Registration failed. Please try again." };
    }
};

// Login User
export const loginUser = async (loginData) => {
    console.log("Sending login request with data:", JSON.stringify(loginData)); // Debugging

    try {
        const response = await axios.post(`http://127.0.0.1:8000/api/user/login/`, loginData, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("API Response:", response.data);
        localStorage.setItem("token", response.data.token);
        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        throw error.response?.data || { error: "Login failed. Please check your credentials." };
    }
};


// Request Password Reset
export const requestPasswordReset = async (email) => {
    console.log("Sending password reset request:", email);
    try {
        const response = await axios.post(`http://127.0.0.1:8000/api/user/password-reset/`, { email });
        console.log("Reset response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Password reset error:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to send reset email" };
    }
};

// Reset Password
export const resetPassword = async (userId, token, password) => {
    console.log("Sending password reset confirmation:", userId, token, password);
    try {
        const response = await axios.post(
            `http://127.0.0.1:8000/api/user/password-reset-confirm/${userId}/${token}/`,
            { password },
            { headers: { "Content-Type": "application/json" } }  // Ensure correct headers
        );
        return response.data;
    } catch (error) {
        console.error("Password reset confirmation error:", error.response?.data || error.message);
        throw error.response?.data || { error: "Password reset failed" };
    }
};

// Logout User
export const logoutUser = async () => {
    try {
        const token = localStorage.getItem("token");
        await axios.post(`http://127.0.0.1:8000/api/user/logout/`, {}, {
            headers: { Authorization: `Token ${token}` },
        });
        localStorage.removeItem("token"); // Remove token
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchLectureHalls = async () => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/timetable/lecture-halls/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching lecture halls:", error);
        throw error;
    }
};

export const fetchTimetable = async (hallId, date = null) => {
    try {
        const params = date ? { params: { date } } : {}; // Optional date filter
        const response = await axios.get(`http://127.0.0.1:8000/api/timetable/timetable/${hallId}/`, params);
        return response.data;
    } catch (error) {
        console.error("Error fetching timetable:", error);
        throw error;
    }
};

export const getPendingApprovals = async () => {
    const response = await fetch(`http://127.0.0.1:8000/api/bookings/pending/`);
    if (!response.ok) throw new Error("Failed to fetch pending approvals");
    return response.json();
};
export const fetchAvailableSlots = async (lectureHallId, date) => {
    try {
        console.log(`Fetching slots for Hall ID: ${lectureHallId} on Date: ${date}`);

        const response = await fetch(
            `http://127.0.0.1:8000/api/bookings/available-slots/?lecture_hall=${lectureHallId}&date=${date}`
        );

        if (!response.ok) {
            console.error("Error response from server:", response.status, response.statusText);
            throw new Error("Failed to fetch available slots");
        }

        const data = await response.json();
        console.log("API Response:", data); // ✅ Debugging

        return Array.isArray(data.available_slots) ? data.available_slots : []; // ✅ Ensure array format
    } catch (error) {
        console.error("Error fetching slots:", error);
        return []; // ✅ Prevents UI crashes
    }
};

export const submitBooking = async (bookingData) => {
    console.log(bookingData);
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`http://127.0.0.1:8000/api/bookings/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify(bookingData),
    });

    const textResponse = await response.text();  // Get raw response first
    console.log("Raw Response:", textResponse);  // Log the response for debugging

    try {
        const jsonResponse = JSON.parse(textResponse); // Try parsing JSON
        if (!response.ok) {
            throw new Error(jsonResponse.error || "Failed to submit booking");
        }
        return jsonResponse;
    } catch (error) {
        console.error("Invalid JSON response:", textResponse); // Log unexpected HTML response
        throw new Error("An unexpected error occurred. Please check the server logs.");
    }
};




