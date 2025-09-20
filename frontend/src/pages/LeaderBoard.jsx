import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import "../LeaderBoard.css";

function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Array of emojis to use for the falling leaves
  const leafEmojis = ['🍃', '🌿', '🍂', '🌾', '🍀', '🍃'];

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("recyclables", "desc"));
        const querySnapshot = await getDocs(q);
        const leadersList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          leadersList.push({
            user: data.name,
            weight: data.recyclables,
          });
        });
        setLeaders(leadersList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) {
    return <p>Loading leaderboard...</p>;
  }

  return (
    // Apply the new class here
    <div className="leaderboard-page"> 
      <div className="main-container">
        {/* This is the container for the leaves */}
        <div className="leaf-container">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="leaf"
              style={{
                '--emoji': `"${leafEmojis[Math.floor(Math.random() * leafEmojis.length)]}"`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
                '--font-size': `${20 + Math.random() * 30}px`,
                '--x-start': `${Math.random() * 100 - 50}px`,
                '--x-end': `${Math.random() * 100 - 50}px`,
                left: `${Math.random() * 100}vw`
              }}
            >
            </div>
          ))}
        </div>

        <div className="containerL my-5">
          <div className="cardL shadow-sm p-4">
            <h2 className="text-success text-center mb-4">
              <span className="trophy">🏆</span>LeaderBoard
            </h2>

            {leaders.length > 0 ? (
              <table className="table table-striped table-hover text-center">
                <thead className="table-success">
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Total Scrap Sold (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, index) => (
                    <tr key={index}>
                      <td><strong>{index + 1}</strong></td>
                      <td>{leader.user}</td>
                      <td>{leader.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-muted">No leaderboard data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderBoard;