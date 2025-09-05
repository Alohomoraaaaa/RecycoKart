import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // your firebase setup
import { signOut } from "firebase/auth";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        {/* Brand / Logo */}
        <Link className="navbar-brand fw-bold" to="/">
          ♻️ RecycoKart
        </Link>

        {/* Toggle for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {!user ? (
              <>
                {/* Show only if not logged in */}
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Show only if logged in */}
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboard">
                    LeaderBoard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="#"
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault(); // prevent navigation
                      handleLogout();
                    }}
                  >
                    Logout
                  </Link>
                </li>

              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
