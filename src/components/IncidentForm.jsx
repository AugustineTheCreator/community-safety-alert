import React, { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const INCIDENT_TYPES = [
  { value: "fire", label: "🔥 Fire/Explosion", color: "bg-red-600" },
  { value: "crime", label: "🚔 Crime/Theft", color: "bg-yellow-500" },
  { value: "violence", label: "⚠️ Violence/Unrest", color: "bg-orange-600" },
  { value: "accident", label: "🚗 Road Accident", color: "bg-blue-600" },
  { value: "disaster", label: "🌊 Natural Disaster", color: "bg-purple-600" },
  { value: "medical", label: "🏥 Medical Emergency", color: "bg-green-600" },
  { value: "other", label: "❓ Other", color: "bg-gray-600" },
];

export default function IncidentForm() {
  const [typeValue, setTypeValue] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle "Use My Location"
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
              import.meta.env.VITE_GOOGLE_MAPS_API_KEY
            }`
          );
          const data = await res.json();

          let address = `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
          if (data.results && data.results.length > 0) {
            address = data.results[0].formatted_address;
          }

          setLocation(address);
          setCoords({ lat, lng });
        } catch (err) {
          console.error("Geocoding failed:", err);
          setLocation(`Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`);
          setCoords({ lat, lng });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        alert("Failed to get your location.");
        console.error(err);
        setLoading(false);
      }
    );
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeValue || !description || !location) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "incidents"), {
        type: INCIDENT_TYPES.find((t) => t.value === typeValue)?.label,
        typeValue,
        color: INCIDENT_TYPES.find((t) => t.value === typeValue)?.color,
        description,
        location,
        coords,
        createdAt: serverTimestamp(),
      });

      alert("✅ Incident reported successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving incident:", err);
      alert("❌ Failed to submit incident. Try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🚨 Report an Incident
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-gray-100"
      >
        {/* Incident Type */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Incident Type <span className="text-red-500">*</span>
          </label>
          <select
            value={typeValue}
            onChange={(e) => setTypeValue(e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select a category --</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose the category that best fits the incident.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what happened..."
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Briefly explain the situation so others can understand.
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter address or use GPS"
              className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={handleUseLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Locating…" : "Use My Location"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Provide the exact address or use your GPS for accuracy.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
