import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase"; // Import the db object

function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const usersRef = collection(db, "users");
        // Create a query to order the users by recyclables in descending order
        const q = query(usersRef, orderBy("recyclables", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        const leadersList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Extract name and recyclables, as seen in your document
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
    <div className="container my-5">
      <div className="card shadow-sm p-4">
        <h2 className="text-success text-center mb-4">🏆 Scrap Sellers LeaderBoard</h2>

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
  );
}

export default LeaderBoard;