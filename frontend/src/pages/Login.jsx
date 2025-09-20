import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Login.css"; // ✅ import the new CSS

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
        setError("❌ You need to register first before logging in with Google.");
        await auth.signOut();
        return;
      }

      const userData = userDoc.data();

      // Redirect based on role
      if (userData.role === "collector") {
        navigate("/dashboard");
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
    <div className="login-page">
      <div
        className="goo-card login-card p-5"
        style={{
          width: "420px",
          minHeight: "520px",
          borderRadius: "20px",
          boxShadow: "0 12px 35px rgba(34, 139, 34, 0.15)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "24px",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <h2 className="text-center text-success mb-4" style={{ fontSize: "2.25rem", fontWeight: "700" }}>
          Login
        </h2>

        <div className="mb-4 text-center" style={{ fontSize: "1rem", color: "#4a4a4a" }}>
          Login using your Google account to continue
        </div>

        {/* Updated Button with Google Logo */}
        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline-success w-100 mb-3"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            padding: "14px 0",
            fontWeight: "600",
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
            }}
          />
          Sign in with Google
        </button>

        {error && (
          <p
            className="text-danger text-center"
            style={{ fontSize: "1rem", fontWeight: "600", marginTop: "8px" }}
          >
            {error}
          </p>
        )}

        <p className="text-center mt-5" style={{ fontSize: "1rem" }}>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
