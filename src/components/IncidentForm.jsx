import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const categories = [
  { value: "fire", label: "🔥 Fire/Explosion", color: "bg-red-600" },
  { value: "crime", label: "🚔 Crime/Theft", color: "bg-yellow-500" },
  { value: "violence", label: "⚠️ Violence/Unrest", color: "bg-orange-600" },
  { value: "accident", label: "🚗 Road Accident", color: "bg-blue-600" },
  { value: "disaster", label: "🌊 Natural Disaster", color: "bg-purple-600" },
  { value: "medical", label: "🏥 Medical Emergency", color: "bg-green-600" },
  { value: "other", label: "❓ Other", color: "bg-gray-500" },
];

function IncidentForm() {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Location search failed:", err);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationName(`📍 Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        setLoading(false);
        setError("");
        setSuggestions([]);
      },
      () => {
        setError("Failed to fetch location. Try searching manually.");
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !description || !locationName || !coords) {
      setError("All fields including location are required.");
      return;
    }
    try {
      await addDoc(collection(db, "incidents"), {
        type,
        description,
        locationName,
        coords,
        timestamp: serverTimestamp(),
      });
      setSuccess(true);
      setDescription("");
      setType("");
      setLocationName("");
      setCoords(null);
      setSuggestions([]);
    } catch (err) {
      setError("Failed to submit. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        🚨 Report an Incident
      </h2>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mb-3">
          ✅ Incident reported successfully!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block font-semibold mb-1">Incident Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          >
            <option value="">Select incident type</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the category that best describes the incident.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a clear description..."
            className="w-full border rounded-lg p-2"
            rows="3"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Keep it short, clear, and factual.
          </p>
        </div>

        {/* Location */}
        <div className="relative">
          <label className="block font-semibold mb-1">Location</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              placeholder="Search or enter location"
              className="flex-grow border rounded-lg p-2"
              required
            />
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Locating..." : "Use My Location"}
            </button>
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto w-full z-10">
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setLocationName(s.display_name);
                    setCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
                    setSuggestions([]);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Accurate location ensures alerts reach the right people.
          </p>
        </div>

        <button
          type="submit"
          disabled={!type || !description || !locationName || !coords}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default IncidentForm;
