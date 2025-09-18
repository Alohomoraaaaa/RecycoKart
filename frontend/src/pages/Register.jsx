import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    role: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      // check if user already exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // new user — save details
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
        // existing user — just redirect based on role
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
      setMessage("❌ " + error.message);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Register</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <form onSubmit={handleGoogleSignIn}>
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

              {/* Contact */}
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

              {/* Role */}
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
                Sign Up with Google
              </button>
            </form>

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
