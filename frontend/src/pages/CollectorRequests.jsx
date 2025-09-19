import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

function CollectorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectorId, setCollectorId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCollectorId(user.uid); // set collector id once user is ready
      } else {
        navigate("/login"); // no user logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!collectorId) return; // wait for auth

    const fetchRequests = async () => {
      try {
        const requestsRef = collection(db, "pickupRequests");
        const q = query(
          requestsRef,
          where("collectorId", "==", collectorId),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(fetchedRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [collectorId]);

  const handleAccept = async (requestId) => {
    try {
      await updateDoc(doc(db, "pickupRequests", requestId), {
        status: "accepted",
      });
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      alert("Request Accepted!");
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, "pickupRequests", requestId), {
        status: "rejected",
      });
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
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
          {requests.map((req) => (
            <div key={req.id} className="list-group-item mb-3 shadow-sm p-3 rounded">
              <h5 className="mb-2 text-primary">
                {req.scrapTypes ? req.scrapTypes.join(", ") : req.scrapType} Pickup
              </h5>
              <p><strong>Date:</strong> {req.date}</p>
              <p><strong>Time:</strong> {req.time}</p>
              <p><strong>User:</strong> {req.userName || "N/A"}</p>
              <p><strong>Phone:</strong> {req.userPhone || "N/A"}</p>
              <p><strong>Pickup Address:</strong> {req.pickupAddress}</p>
              <div className="mt-3">
                <button
                  className="btn btn-success me-2"
                  onClick={() => handleAccept(req.id)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleReject(req.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectorRequests;
