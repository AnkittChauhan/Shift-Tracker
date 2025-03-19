import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ClockInOut from "./components/ClockInOut";
import Dashboard from "./components/Dashboard";
import AuthPage from "./components/AuthPage";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
        <Route path="/" element={ < AuthPage /> } />
          <Route path="/User" element={<ClockInOut />} />
          <Route path="/ManagerDashboard" element={<Dashboard />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;