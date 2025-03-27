import React, { useState, useEffect } from "react";
import { registerUser } from "../../api";
import { addNewAuthority } from "../../api";
import Header from "../Basic/Header";
import UserNavbar from "../Basic/UserNavbar"
import "./register.css"
import axiosInstance from "../../api";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "student",
        authorities: []  // This should hold the selected authority **IDs**
    });

    const [availableAuthorities, setAvailableAuthorities] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAuthorities, setSelectedAuthorities] = useState([]); // This holds selected objects
    const [showDropdown, setShowDropdown] = useState(false);
    const [newAuthority, setNewAuthority] = useState({ name: "", email: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAuthorities = async () => {
            try {
                const response = await axiosInstance.get("/user/authorities/");
                setAvailableAuthorities(response.data);
            } catch (error) {
                console.error("Error fetching authorities:", error);
            }
        };

        fetchAuthorities(); // Call the async function
    }, []); 

    // Extract names from fetched data
    const items = availableAuthorities.map(auth => auth.name);

    // Filter items based on search
    const filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));

    // **Load selected authorities into formData when selectedAuthorities changes**
    useEffect(() => {
        setFormData(prevState => ({
            ...prevState,
            authorities: selectedAuthorities.map(auth => auth.id) // Store only IDs
        }));
    }, [selectedAuthorities]);

    // Handle selection
    const handleSelect = (authorityName) => {
        const authorityObj = availableAuthorities.find(auth => auth.name === authorityName);
        if (authorityObj && !selectedAuthorities.some(auth => auth.id === authorityObj.id)) {
            setSelectedAuthorities([...selectedAuthorities, authorityObj]); // Maintain order
        }
        setSearchTerm(""); // Clear search after selection
    };

    // Handle deselection
    const handleRemove = (authorityId) => {
        setSelectedAuthorities(selectedAuthorities.filter(auth => auth.id !== authorityId));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNewAuthority = async () => {
        if (!newAuthority.name || !newAuthority.email) {
            alert("Both name and email are required!");
            return;
        }
        try {
            const createdAuthority = await addNewAuthority(newAuthority);
            
            setAvailableAuthorities([...availableAuthorities, createdAuthority]);
            setSelectedAuthorities([...selectedAuthorities, createdAuthority]);
            setNewAuthority({ name: "", email: "" });
    
            alert("Authority added successfully!");
        } catch (error) {
            console.error("Error adding authority:", error);
            alert(error.error || "Failed to add authority.");
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Submitting Data:", formData);
            const data = await registerUser(formData);
            alert("Registration Successful!");
            console.log(data.data);
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.error || "An error occurred during registration.");
        }
    };

    return (
        <div>
            <UserNavbar />
            <Header />
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <select name="role" onChange={handleChange} required>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                </select>

                <h4>Authorities</h4>
                <div style={{ width: "300px", position: "relative" }}>
                    {/* Selected Items */}
                    <div style={{ minHeight: "40px", padding: "5px", border: "1px solid #ccc", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {selectedAuthorities.map((auth) => (
                            <span key={auth.id} style={{ background: "#ddd", padding: "5px", borderRadius: "5px", display: "flex", alignItems: "center" }}>
                                {auth.name}
                                <button onClick={() => handleRemove(auth.id)} style={{ marginLeft: "5px", border: "none", background: "transparent", cursor: "pointer" }}>✖</button>
                            </span>
                        ))}
                    </div>

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search authorities..."
                        value={searchTerm}
                        onFocus={() => setShowDropdown(true)}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "8px", border: "1px solid #ccc", marginTop: "5px" }}
                    />

                    {/* Dropdown List */}
                    {showDropdown && (
                        <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ccc", position: "absolute", width: "100%", background: "white", zIndex: 1000 }}>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelect(item)}
                                        style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                                    >
                                        {item}
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "10px" }}>No results found</div>
                            )}
                        </div>
                    )}
                </div>

                <h4>Add New Authority</h4>
                <input
                    type="text"
                    placeholder="Authority Name"
                    value={newAuthority.name}
                    onChange={(e) => setNewAuthority({ ...newAuthority, name: e.target.value })}
                    // required
                />
                <input
                    type="email"
                    placeholder="Authority Email"
                    value={newAuthority.email}
                    onChange={(e) => setNewAuthority({ ...newAuthority, email: e.target.value })}
                    // required
                />
                <button type="button" onClick={handleNewAuthority} style={{marginTop:"200px"}}>Add Authority</button>

                <button type="submit" style={{marginTop:"200px"}}>Register</button>
            </form>
        </div>
    );
};

export default Register;


