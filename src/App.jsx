import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import IncidentForm from "./components/IncidentForm";
import ReportsDashboard from "./components/ReportsDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white p-4 flex justify-between">
          <h1 className="font-bold text-xl">Community Safety Alert 🚨</h1>
          <div className="space-x-4">
            <Link to="/" className="hover:underline">
              Report
            </Link>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </div>
        </nav>

        {/* Pages */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<IncidentForm />} />
            <Route path="/dashboard" element={<ReportsDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
