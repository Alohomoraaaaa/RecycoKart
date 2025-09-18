import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Block login if user hasn't registered
        setError(
          "❌ You need to register first before logging in with Google."
        );
        await auth.signOut(); // logout the Google session
        return;
      }

      const userData = userDoc.data();

      // Redirect based on role
      if (userData.role === "collector") {
        navigate("/collector-setup");
      } else if (userData.role === "user") {
        navigate("/dashboard");
      } else {
        setError("❌ Role not assigned. Please register properly.");
        await auth.signOut();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h2 className="text-center text-success mb-4">Login</h2>

        {/* Info text */}
        <div className="mb-3 text-center">
          <p className="text-muted">
            Login using your Google account to continue
          </p>
        </div>

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline-success w-100 mb-3"
        >
          <i className="bi bi-google me-2"></i> Sign in with Google
        </button>

        {/* Error message */}
        {error && <p className="text-danger text-center">{error}</p>}

        <p className="text-center mt-3">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
