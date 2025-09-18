import React, { useEffect, useState } from "react";
import { auth } from "../firebase"; // Import auth for userId

function EcoBadges() {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch user’s cumulative impact & badge
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
  }, []);

  const getBadgeFromWeight = (totalWeight) => {
    if (totalWeight >= 5 && totalWeight < 10) return "Bronze Recycler 🥉";
    if (totalWeight >= 10 && totalWeight < 15) return "Silver Recycler 🥈";
    if (totalWeight >= 15 && totalWeight < 20) return "Gold Recycler 🥇";
    if (totalWeight >= 20 && totalWeight < 50) return "Platinum Recycler 🏅";
    if (totalWeight >= 50) return "Recycling Warrior🏆";
    return null;
  };

  if (loading) return <p>Loading environmental impact...</p>;
  if (!impact || Object.keys(impact).length === 0)
    return <p>No environmental impact data found.</p>;

  const badge = getBadgeFromWeight(impact.total_weight);

  return (
   <div className="mt-7 text-center">
      

      <h2 className="mt-2 text-success p-2">🏅 Eco Badges</h2>
      <div>
        {badge ? (
          <span className="badge bg-warning fs-6 text-dark fw-normal">{badge}</span>
        ) : (
          <p>Recycle more to earn your first badge!</p>
        )}
      </div>
    </div>
  );
}

export default EcoBadges;