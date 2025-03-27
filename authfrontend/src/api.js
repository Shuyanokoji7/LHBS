import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api",  // Set your base API URL
});

// Add a request interceptor to include the token only if it exists
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        console.log("Using Token:", token);  // Debugging
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        console.log("Axios Request Headers:", config.headers);  // Debugging
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
// Register User
export const registerUser = async (userData) => {
    console.log("Sending user data:", userData);
    try {
        const response = await axiosInstance.post(`/user/register/`, userData);
        console.log("API Response:", response);
        return response.data;
    } catch (err) {
        console.error("Registration Error:", err.response?.data || err.message);
        throw err.response?.data || { error: "Registration failed. Please try again." };
    }
};

// Login User
export const loginUser = async (loginData) => {
    console.log("Sending login request with data:", JSON.stringify(loginData)); // Debugging

    try {
        const response = await axiosInstance.post(`http://127.0.0.1:8000/api/user/login/`, loginData, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("API Response:", response.data.role);
        localStorage.setItem("token", response.data.token);        
        localStorage.setItem("userID", response.data.user_id);        
        localStorage.setItem("role", response.data.role);
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
        const response = await axiosInstance.post(`http://127.0.0.1:8000/api/user/password-reset/`, { email });
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
        const response = await axiosInstance.post(
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
        if (!token) return; 

        await axiosInstance.post(`/user/logout/`, {}, {
            headers: { Authorization: `Bearer ${token}` }, 
        });

        localStorage.removeItem("token");
        localStorage.removeItem("userID");
        localStorage.removeItem("role");

        console.log("User logged out successfully.");
    } catch (error) {
        console.error("Logout error:", error.response?.data || error.message);
        throw error.response?.data || { error: "Logout failed. Please try again." };
    }
};


export const fetchLectureHalls = async () => {
    try {
        const response = await axiosInstance.get(`http://127.0.0.1:8000/api/timetable/lecture-halls/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching lecture halls:", error);
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await axiosInstance.get(`http://127.0.0.1:8000/api/user/getusers/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching lecture halls:", error);
        throw error;
    }
};


export const fetchTimetable = async (hallId, date = null) => {
    try {
        const params = date ? { params: { date } } : {}; // Optional date filter
        const response = await axiosInstance.get(`http://127.0.0.1:8000/api/timetable/${hallId}/`, params);
        return response.data;
    } catch (error) {
        console.error("Error fetching timetable:", error);
        throw error;
    }
};

export const getPendingApprovals = async () => {
    try {
        const userId = localStorage.getItem("userID"); 

        if (!userId) {
            throw new Error("User ID not found in local storage");
        }

        const response = await axiosInstance.post(`/bookings/pending/`, { user: userId }); // Send user ID in request body

        return response.data;

    } catch (error) {
        console.error("Error fetching pending approvals:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch pending approvals" };
    }
};

export const fetchAvailableSlots = async (lectureHallId, date) => {
    try {
        console.log(`Fetching slots for Hall ID: ${lectureHallId} on Date: ${date}`);

        const response = await axiosInstance.get(`/bookings/available-slots/`, {
            params: { lecture_hall: lectureHallId, date: date },
        });

        console.log("API Response:", response.data); // ✅ Debugging

        return Array.isArray(response.data.available_slots) ? response.data.available_slots : [];
    } catch (error) {
        console.error("Error fetching slots:", error.response?.data || error.message);
        return []; // ✅ Prevents UI crashes
    }
};

export const submitBooking = async (bookingData) => {
    try {
        console.log("Submitting Booking Data:", bookingData);

        const response = await axiosInstance.post(`/bookings/create/`, bookingData);

        console.log("API Response:", response.data); // ✅ Debugging

        return response.data;
    } catch (error) {
        console.error("Error submitting booking:", error.response?.data || error.message);
        throw error.response?.data || { error: "Booking submission failed." };
    }
};

export const searchBookings = async (lectureHall = "", user = "") => {
    try {
        const response = await axiosInstance.get(`/bookings/search/`, {
            params: { lecture_hall: lectureHall, user: user },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching future bookings:", error);
        throw error;
    }
};

export const deleteBooking = async (bookingId) => {
    try {
        await axiosInstance.delete(`/bookings/delete/${bookingId}/`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting booking:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchBookingHistory = async () => {
    const userId = localStorage.getItem("userID");

    if (!userId) throw new Error("User ID not found. Please log in again.");

    try {
        const response = await axiosInstance.post(`/bookings/history/`, { user: userId });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch booking history:", error.response?.data || error.message);
        throw error.response?.data || { error: "Could not fetch booking history." };
    }
};

export const downloadBill = async (bookingId) => {
    try {
        const response = await axiosInstance.get(`/bookings/generate-bill/${bookingId}/`, {
            responseType: "blob", // Ensures we receive binary data
        });

        if (!response || response.status !== 200) {
            throw new Error("Failed to download bill");
        }

        return response.data; // Return the blob so it can be handled in the component
    } catch (error) {
        console.error("Error downloading bill:", error);
        throw new Error("Failed to download bill. Please try again.");
    }
};

export const addNewAuthority = async (authorityData) => {
    try {
        const response = await axiosInstance.post(`/user/createauthorities/`, authorityData);
        return response.data;
    } catch (error) {
        console.error("Error adding authority:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to add authority." };
    }
};