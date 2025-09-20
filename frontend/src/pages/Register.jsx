import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", contact: "", role: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();

    // validate phone number
    if (!/^\d{10}$/.test(formData.contact)) {
      setMessage("Please enter a valid 10-digit contact number.");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: formData.name,
          email: user.email,
          contact: formData.contact,
          role: formData.role,
        });

        if (formData.role === "collector") {
          await setDoc(doc(db, "collectors", user.uid), {
            scrapTypes: [],
            availability: { start: "", end: "" },
          });
          navigate("/collector-setup");
        } else {
          navigate("/");
        }
      } else {
        const data = userSnap.data();
        if (data.role === "collector") {
          navigate("/collector-setup");
        } else {
          navigate("/");
        }
      }

      setMessage("✅ Registration successful!");
      setFormData({ name: "", contact: "", role: "" });
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    }
  };

  return (
    <div className="page-bg">
      <div className="glass-card">
        <h2 className="text-center text-success mb-4" style={{ fontSize: "2.25rem", fontWeight: "700" }}>
          Register
        </h2>
        <form onSubmit={handleGoogleSignIn}>
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

          <div className="mb-4">
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

          <button
            type="submit"
            className="btn btn-outline-success w-100"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              padding: "14px 10px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              style={{
                width: 22,
                height: 22,
                marginRight: 12,
                background: "white",
                borderRadius: 2,
                objectFit: "cover",
                boxShadow: "0 1px 2px rgba(60,64,67,.1)",
              }}
            />
            Sign Up with Google
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-3 ${
              message.startsWith("✅") ? "text-success" : "text-danger"
            }`}
            style={{ fontSize: "1rem", fontWeight: "600" }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
