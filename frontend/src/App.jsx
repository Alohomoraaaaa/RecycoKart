//App.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
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
import LeaderBoard from "./pages/LeaderBoard";
import CompletePickup from "./pages/CompletePickup";
import WastePrediction from "./pages/WastePrediction";
<<<<<<< HEAD
import ScrapClassifier from "./pages/ScrapClassifier";
=======
import PriceGraph from "./pages/PriceGraph";
>>>>>>> 18c8f71e7214fd67e2d9da6bc95fa958cb2d6d80

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
        <Route path="/leaderboard" element={<LeaderBoard />} />
        <Route path="/complete-pickup/:requestId" element={<CompletePickup />} />
        <Route path="/waste-prediction" element={<WastePrediction />} />
<<<<<<< HEAD
        <Route path="/classify" element={<ScrapClassifier />} />
=======
        <Route path="/price-graph" element={<PriceGraph />} />
>>>>>>> 18c8f71e7214fd67e2d9da6bc95fa958cb2d6d80
      </Routes>
    </Router>
  );
}

export default App;
