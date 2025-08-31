import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pickup from "./pages/Pickup";
import PickupResult from "./pages/PickupResult";
import CollectorSetup from "./pages/CollectorSetup";
import CollectorRequests from "./pages/CollectorRequests";
import PickupSummary from "./pages/PickupSummary";

function App() {
  return (
    <Router>
      {/* Navbar on top */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pickup" element={<Pickup />} />
        <Route path="/pickupresult" element={<PickupResult />} />
        <Route path="/collector-setup" element={<CollectorSetup />} />
        <Route path="/collector-requests" element={<CollectorRequests />} />
        <Route path="/pickup-summary" element={<PickupSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
