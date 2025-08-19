import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function IncidentForm({ onSubmit }) {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);

  // 🔹 This is the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type || !description || !location) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, "incidents"), {
        type,
        description,
        location,
        date: new Date().toISOString(),
      });

      console.log("Incident stored with ID:", docRef.id);

      // Update local state (UI still works instantly)
      onSubmit({
        id: docRef.id,
        type,
        description,
        location,
        image,
        date: new Date().toISOString(),
      });

      // Reset form
      setType("");
      setDescription("");
      setLocation("");
      setImage(null);
      e.target.reset();
    } catch (error) {
      console.error("Error adding incident:", error);
      alert("Failed to save report. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 space-y-4 w-full max-w-lg mx-auto mt-6"
    >
      <h2 className="text-xl font-semibold text-gray-700 text-center sm:text-left">
        Report an Incident
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 bg-white"
        >
          <option value="">Select incident type</option>
          <option value="Crime">Crime</option>
          <option value="Accident">Accident</option>
          <option value="Fire">Fire</option>
          <option value="Medical Emergency">Medical Emergency</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          rows="3"
          placeholder="Describe what happened..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          placeholder="Enter location..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full mt-1"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto sm:px-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Submit Report
      </button>
    </form>
  );
}
