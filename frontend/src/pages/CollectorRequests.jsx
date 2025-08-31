import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function CollectorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const collectorId = auth.currentUser?.uid; // assuming collector is logged in

  useEffect(() => {
    if (!collectorId) {
      navigate("/login");
      return;
    }

    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, "pickupRequests");
        const q = query(requestsRef, where("collectorId", "==", collectorId), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(fetchedRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [collectorId, navigate]);

  const handleAccept = async (requestId) => {
    try {
      await updateDoc(doc(db, "pickupRequests", requestId), { status: "accepted" });
      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert("Request Accepted!");
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, "pickupRequests", requestId), { status: "rejected" });
      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert("Request Rejected");
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading requests...</p>;

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Pickup Requests</h2>
      {requests.length === 0 ? (
        <p className="text-center">No pending requests at the moment.</p>
      ) : (
        <div className="list-group">
          {requests.map(req => (
            <div key={req.id} className="list-group-item mb-2">
              <h5>{req.scrapType} Pickup</h5>
              <p><strong>Weight:</strong> {req.weight} kg</p>
              <p><strong>Date:</strong> {req.date}</p>
              <p><strong>Time:</strong> {req.time}</p>
              <p><strong>User Address:</strong> {req.pickupAddress}</p>
              <div>
                <button className="btn btn-success me-2" onClick={() => handleAccept(req.id)}>Accept</button>
                <button className="btn btn-danger" onClick={() => handleReject(req.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectorRequests;
