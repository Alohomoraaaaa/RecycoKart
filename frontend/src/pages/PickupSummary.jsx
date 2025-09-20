import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import "../styles/PickupSummary.css";

function PickupSummary() {
  const location = useLocation();
  const { requestData } = location.state;

  const [impact, setImpact] = useState(null);
  const [collectorAddress, setCollectorAddress] = useState("");
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    const scrapsList =
      requestData.scraps && requestData.scraps.length > 0
        ? requestData.scraps
        : [{ scrap_type: requestData.scrapType, weight: requestData.weight }];

    fetch("http://127.0.0.1:5000/environmental_impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scraps: scrapsList }),
    })
      .then((res) => res.json())
      .then((data) => setImpact(data))
      .catch((err) => console.error("Error fetching impact:", err));

    const fetchCollectorAddress = async () => {
      try {
        const collectorRef = doc(db, "users", requestData.collectorId);
        const collectorSnap = await getDoc(collectorRef);
        if (collectorSnap.exists()) {
          setCollectorAddress(collectorSnap.data().address);
        }
      } catch (error) {
        console.error("Error fetching collector address:", error);
      }
    };

    fetchCollectorAddress();
    return () => clearTimeout(timer);
  }, [requestData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="pickup-summary-page">
      <div className="summary-card container my-5 position-relative">
        {showConfetti && (
          <Confetti width={1000} height={1000} recycle={false} />
        )}

        <h2 className="text-success mb-4 text-center">Pickup Summary ♻️</h2>

        <motion.div
          className="summary-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left column */}
          <div>
            <motion.p variants={itemVariants}>
              <strong>Pickup Date:</strong> {requestData.date}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Pickup Time:</strong> {requestData.time}
            </motion.p>

            <motion.h5 className="mt-3" variants={itemVariants}>
              Scrap Details
            </motion.h5>
            <motion.div variants={itemVariants}>
              {requestData.scraps && requestData.scraps.length > 0 ? (
                <ul>
                  {requestData.scraps.map((item, index) => (
                    <li key={index}>
                      {item.scrap_type} - {item.weight} kg
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {requestData.scrapType} - {requestData.weight} kg
                </p>
              )}
            </motion.div>

            <motion.h5 className="mt-3" variants={itemVariants}>
              Collector Details
            </motion.h5>
            <motion.p variants={itemVariants}>
              <strong>Name:</strong> {requestData.collectorName}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Locality:</strong> {collectorAddress}
            </motion.p>

            <motion.h5 className="mt-3" variants={itemVariants}>
              Amount Paid
            </motion.h5>
            <motion.p variants={itemVariants}>
              <strong>Amount Paid:</strong> ₹ {requestData.amount}
            </motion.p>
          </div>

          {/* Right column */}
          {impact && (
            <motion.div className="impact-box mt-4" variants={itemVariants}>
              <h5 className="mb-3">🌱 Environmental Impact (Total)</h5>
              <p>CO₂ Saved: {impact.co2_saved} kg</p>
              <p>Water Conserved: {impact.water_conserved} L</p>
              <p>Landfill Diverted: {impact.landfill_diverted} kg</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default PickupSummary;
