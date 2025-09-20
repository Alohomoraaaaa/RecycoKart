import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase"; // ✅ make sure db is exported from firebase.js
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Home.css";

function Home() {
  // 🔹 NEW: states for auth + role
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Listen for auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // 🔹 Fetch role from Firestore users collection
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role); // role must be "user" or "collector"
          } else {
            setRole(null);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-5 text-center">Loading...</div>;
  }


  return (
    <div>
      {/* Hero Section */}
      <section className="bg-light text-dark py-5">
        <div className="container text-center">
          <h1 className="fw-bold text-success display-4">
            ♻️ RecycoKart
          </h1>
          <p className="lead mt-3">
            Sell Your Recyclables with Ease — connect with verified collectors, 
            get live prices, and book pickups all in one platform.
          </p>
          <Link
          className="btn btn-success btn-lg mt-3"
            // 🔹 CHANGE: role-based navigation
            to={
              !user
                ? "/register"
                : role === "user"
                ? "/pickup"
                : role === "collector"
                ? "/dashboard"
                : "/"
            }
            
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container my-5">
        <h2 className="text-center text-success mb-4">Why Choose Us?</h2>
        <div className="row text-center">
          <div className="col-md-3 mb-3">
            <div className="card feature-card p-3 shadow-sm">
              <h5><span className="icon">📦 Easy Pickup</span></h5>
              <p>Book scrap pickup with just a few clicks.</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card feature-card p-3 shadow-sm">
              <h5><span className="icon">💰 Fair Pricing</span></h5>
              <p>Get real-time and transparent scrap prices.</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card feature-card p-3 shadow-sm">
              <h5><span className="icon">♻️ Eco-Friendly</span></h5>
              <p>Promote sustainable waste management.</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card feature-card p-3 shadow-sm">
              <h5><span className="icon">🤝 Verified Collectors</span></h5>
              <p>Connect with trusted and reliable partners.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;