import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase"; // make sure this path matches your firebase.js

function Home() {
  const isLoggedIn = !!auth.currentUser; // check if user is logged in

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
            to={isLoggedIn ? "/pickup" : "/register"}
            className="btn btn-success btn-lg mt-3"
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
            <div className="card p-3 shadow-sm">
              <h5>📦 Easy Pickup</h5>
              <p>Book scrap pickup with just a few clicks.</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>💰 Fair Pricing</h5>
              <p>Get real-time and transparent scrap prices.</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>♻️ Eco-Friendly</h5>
              <p>Promote sustainable waste management.</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm">
              <h5>🤝 Verified Collectors</h5>
              <p>Connect with trusted and reliable partners.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
