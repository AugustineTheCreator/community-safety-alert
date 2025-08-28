import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// CATEGORY METADATA
const TYPE_META = {
  fire:     { emoji: "🔥", colorHex: "#ef4444", label: "Fire/Explosion" },
  crime:    { emoji: "🚔", colorHex: "#f59e0b", label: "Crime/Theft" },
  violence: { emoji: "⚠️", colorHex: "#ea580c", label: "Violence/Unrest" },
  accident: { emoji: "🚗", colorHex: "#2563eb", label: "Road Accident" },
  disaster: { emoji: "🌊", colorHex: "#7c3aed", label: "Natural Disaster" },
  medical:  { emoji: "🏥", colorHex: "#16a34a", label: "Medical Emergency" },
  other:    { emoji: "❓", colorHex: "#6b7280", label: "Other" },
};

// FORMAT TIMESTAMP
function formatTimestamp(ts) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleString();
  } catch {
    return "—";
  }
}

// FIT MAP BOUNDS
function FitBounds({ incidents }) {
  const map = useMap();
  useEffect(() => {
    const pts = incidents
      .filter((i) => i.coords?.lat && i.coords?.lng)
      .map((i) => [i.coords.lat, i.coords.lng]);

    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [50, 50] });
    } else {
      map.setView([6.5244, 3.3792], 10); // fallback Lagos
    }
  }, [incidents, map]);
  return null;
}

// MARKER ICON
function markerIconFor(typeValue = "other") {
  const meta = TYPE_META[typeValue] || TYPE_META.other;
  return new L.DivIcon({
    className: "custom-marker",
    html: `
      <div style="
        background:${meta.colorHex};
        color:white;
        border-radius:50%;
        width:40px;
        height:40px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
        box-shadow:0 6px 18px rgba(0,0,0,0.25);
        transform: translateY(-4px);
      ">
        ${meta.emoji}
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10],
  });
}

export default function ReportsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "map"
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // LIVE FIRESTORE DATA
  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // FILTERED INCIDENTS
  const filtered = incidents.filter((inc) => {
    const byType = filterType === "All" || inc.typeValue === filterType;
    const term = search.trim().toLowerCase();
    const bySearch =
      !term ||
      inc.description?.toLowerCase().includes(term) ||
      inc.location?.toLowerCase().includes(term) ||
      inc.type?.toLowerCase().includes(term);
    return byType && bySearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          🚨 Community Incident Reports
        </h2>

        {/* TABS */}
        <div className="flex gap-2">
          {["list", "map"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab === "list" ? "📋 List View" : "🗺️ Map View"}
            </button>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.emoji} {meta.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search description or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg w-52 sm:w-72 text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => {
              setFilterType("All");
              setSearch("");
            }}
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100"
          >
            Reset
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Showing <b>{filtered.length}</b> of {incidents.length}
        </div>
      </div>

      {/* LIST VIEW (CARDS ONLY) */}
      {activeTab === "list" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <div className="text-6xl mb-3">🔍</div>
              <p className="text-lg font-medium">No incidents match your filters.</p>
              <p className="text-sm">Try changing the category or search term.</p>
            </div>
          )}

          {filtered.map((inc) => {
            const meta = TYPE_META[inc.typeValue || "other"];
            return (
              <article
                key={inc.id}
                className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-md hover:shadow-xl transition border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white"
                      style={{ background: meta.colorHex }}
                      aria-hidden
                    >
                      {meta.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(inc.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-800 font-medium mb-2">
                  {inc.description || "No description"}
                </p>
                <p className="text-gray-600 text-sm">📍 {inc.location || "GPS"}</p>
              </article>
            );
          })}
        </div>
      )}

      {/* MAP VIEW */}
      {activeTab === "map" && (
        <div className="h-[500px] sm:h-[600px] w-full bg-white rounded-xl shadow-lg overflow-hidden transition-all">
          <MapContainer
            center={[6.5244, 3.3792]}
            zoom={10}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds incidents={filtered} />
            {filtered.map(
              (inc) =>
                inc.coords && (
                  <Marker
                    key={inc.id}
                    position={[inc.coords.lat, inc.coords.lng]}
                    icon={markerIconFor(inc.typeValue)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div
                          className="inline-flex items-center gap-1 text-white px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            background:
                              TYPE_META[inc.typeValue || "other"].colorHex,
                          }}
                        >
                          <span>{TYPE_META[inc.typeValue || "other"].emoji}</span>
                          <span>{TYPE_META[inc.typeValue || "other"].label}</span>
                        </div>
                        <div className="mt-2">{inc.description}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          📍 {inc.location || "GPS"} <br />
                          🕒 {formatTimestamp(inc.createdAt)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate("/")}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-105 focus:outline-none"
        aria-label="Report incident"
        title="Report incident"
      >
        ➕
      </button>
    </div>
  );
}
