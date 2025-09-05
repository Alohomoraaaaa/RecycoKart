import React, { useEffect, useState } from "react";

function ImpactSection({ userId }) {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:5000/api/impact/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setImpact(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching impact:", err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading environmental impact...</p>;
  if (!impact) return <p>No environmental impact data found.</p>;

  return (
    <div className="mt-4">
      <h5 className="mt-3">🌍 Environmental Impact</h5>
      <p>CO₂ Saved: {impact.co2_saved} kg</p>
      <p>Water Conserved: {impact.water_conserved} L</p>
      <p>Landfill Diverted: {impact.landfill_diverted} kg</p>

      <h6 className="mt-3">🏅 Eco Badges</h6>
      <div>
        {impact.co2_saved > 100 && (
          <span className="badge bg-success me-2">🌱 Green Saver</span>
        )}
        {impact.water_conserved > 500 && (
          <span className="badge bg-primary me-2">💧 Water Guardian</span>
        )}
        {impact.landfill_diverted > 200 && (
          <span className="badge bg-warning text-dark me-2">♻️ Waste Warrior</span>
        )}
        {impact.co2_saved > 100 &&
          impact.water_conserved > 500 &&
          impact.landfill_diverted > 200 && (
            <span className="badge bg-danger">🏆 Eco Champion</span>
        )}
      </div>
    </div>
  );
}

export default ImpactSection;
