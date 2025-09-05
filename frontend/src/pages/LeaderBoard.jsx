import { useEffect, useState } from "react";

function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/LeaderBoard") // Flask API
      .then((res) => res.json())
      .then((data) => setLeaders(data))
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

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
