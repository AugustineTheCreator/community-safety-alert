import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // 🔹 Listen to Firestore changes in real time
    const q = query(collection(db, "incidents"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(data);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  return (
    <div className="mt-6 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Recent Reports
      </h2>
      {incidents.length === 0 ? (
        <p className="text-gray-500 text-sm">No reports yet.</p>
      ) : (
        <ul className="space-y-4">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <h3 className="font-semibold text-blue-700">{incident.type}</h3>
              <p className="text-sm text-gray-600">{incident.description}</p>
              <p className="text-xs text-gray-400">
                📍 {incident.location} | 🕒{" "}
                {new Date(incident.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
