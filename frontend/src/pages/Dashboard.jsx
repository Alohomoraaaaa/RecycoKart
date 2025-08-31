import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

function Dashboard() {
  const navigate = useNavigate();

  // States
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalEarnings: 0, recyclables: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Fetch Profile
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
          const data = profileSnap.data();

          if (data.role === "user") {
            // --- Real-time listener for accepted pickups ---
            const requestsRef = collection(db, "pickupRequests");
            const q = query(requestsRef, where("userId", "==", user.uid));

            const unsubscribe = onSnapshot(q, (snapshot) => {
              const activities = [];
              snapshot.forEach((doc) => {
                const requestData = doc.data();
                activities.push({ id: doc.id, ...requestData });
              });

              // Update dashboard stats + activities
              let totalOrders = activities.length;
              let totalEarnings = activities.reduce((sum, r) => sum + (r.price || 0), 0);
              let recyclables = activities.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

              setStats({ totalOrders, totalEarnings, recyclables });
              setRecentActivity(activities.slice(-5).reverse()); // last 5 requests
            });

            return () => unsubscribe();
          } else if (data.role === "collector") {
            // Fetch Collector Bookings
            const bookingsRef = collection(db, "pickupRequests");
            const q = query(bookingsRef, where("collectorId", "==", user.uid));
            const bookingsSnap = await getDocs(q);

            let bookings = [];
            bookingsSnap.forEach((doc) => {
              bookings.push({ id: doc.id, ...doc.data() });
            });
            setMyBookings(bookings);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleBookPickup = () => navigate("/pickup");
  const handleViewPrices = () => navigate("/prices");

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!profile) return <p className="text-center mt-5">No profile found.</p>;

  return (
    <div className="container my-5">
      <h2 className="text-success mb-4">Welcome {profile.name} 👋</h2>

      {/* USER DASHBOARD */}
      {profile.role === "user" && (
        <>
          {/* Stats Row */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3 text-center">
                <h5 className="text-muted">Total Orders</h5>
                <h2 className="text-success">{stats.totalOrders}</h2>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3 text-center">
                <h5 className="text-muted">Total Earnings</h5>
                <h2 className="text-primary">₹ {stats.totalEarnings}</h2>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3 text-center">
                <h5 className="text-muted">Recyclables Sold</h5>
                <h2 className="text-warning">{stats.recyclables} kg</h2>
              </div>
            </div>
          </div>

          {/* Profile + Actions */}
          <div className="row mt-4">
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm p-3">
                <h5 className="text-success">Your Profile</h5>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Contact:</strong> {profile.contact}</p>
                <p><strong>Locality:</strong> {profile.address}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
              </div>
            </div>

            <div className="col-md-8 mb-3">
              <div className="card shadow-sm p-3">
                <h5 className="text-success mb-3">Quick Actions</h5>
                <div className="d-flex gap-3 flex-wrap">
                  <button className="btn btn-success" onClick={handleBookPickup}>Book Pickup</button>
                  <button className="btn btn-primary" onClick={handleViewPrices}>View Prices</button>
                  <button className="btn btn-warning">Download Report</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-success text-white">Recent Activity</div>
            <div className="card-body">
              {recentActivity.length > 0 ? (
                <div className="row">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card p-3 shadow-sm h-100">
                        <h6 className="text-success mb-2">{activity.scrapType} Pickup</h6>
                        <p className="mb-1"><strong>Date:</strong> {activity.date}</p>
                        <p className="mb-1"><strong>Weight:</strong> {activity.weight} kg</p>
                        <p className="mb-1"><strong>Status:</strong> 
                          <span className={activity.status === "accepted" ? "text-success" : "text-muted"}>
                            {activity.status}
                          </span>
                        </p>
                        {activity.collectorName && (
                          <p className="mb-1"><strong>Collector:</strong> {activity.collectorName}</p>
                        )}

                        {/* Button to see full summary */}
                        {activity.status === "accepted" && (
                          <button 
                            className="btn btn-outline-success btn-sm mt-2"
                            onClick={() => navigate("/pickup-summary", { state: { requestData: activity } })}
                          >
                            View Pickup Summary
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recent activity</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* COLLECTOR DASHBOARD */}
      {profile.role === "collector" && (
        <>
          <div className="card p-4 shadow-sm mb-4">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Contact:</strong> {profile.contact}</p>
            <p><strong>Locality:</strong> {profile.address}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>

          {/* Quick Actions for Collectors */}
          <div className="card shadow-sm p-3 mb-4">
            <h5 className="text-success mb-3">Quick Actions</h5>
            <div className="d-flex gap-3 flex-wrap">
              <button className="btn btn-primary" onClick={() => navigate("/collector-requests")}>
                View Requests
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <h4>📦 My Bookings</h4>
          <div className="card shadow-sm p-3 mt-3">
            {myBookings.length > 0 ? (
              <ul>
                {myBookings.map((booking, index) => (
                  <li key={index}>
                    {booking.scrapType} - {booking.date} ({booking.weight} kg)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
