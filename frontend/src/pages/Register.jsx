import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    address: "",
    role: "",
  });

  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(formData.contact)) {
      setMessage("Please enter a valid 10-digit contact number.");
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Save basic user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        address: formData.address,
        role: formData.role,
      });

      // If user is a collector, create a collector document for setup
      if (formData.role === "collector") {
        await setDoc(doc(db, "collectors", user.uid), {
          scrapTypes: [],
          availability: { start: "", end: "" }, // will update later
        });
        navigate("/collector-setup"); // redirect to collector setup
      } else {
        navigate("/"); // redirect normal users
      }

      setMessage("✅ Registration successful!");
      setFormData({
        name: "",
        email: "",
        password: "",
        contact: "",
        address: "",
        role: "",
      });
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Register</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  name="contact"
                  className="form-control"
                  placeholder="Enter Your Contact Number"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Locality */}
              <div className="mb-3">
                <label className="form-label">Locality</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="Enter Your Location"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="mb-3">
                <label className="form-label">I Am Registering As</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="collector">Collector</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-success w-100">
                Register
              </button>
            </form>

            {/* Message */}
            {message && (
              <p
                className={`text-center mt-3 ${
                  message.startsWith("✅") ? "text-success" : "text-danger"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;