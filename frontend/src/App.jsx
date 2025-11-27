import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ClockInOut from "./components/ClockInOut";
import ManagerDashboard from "./components/ManagerDashboard";
import AuthPage from "./components/AuthPage";
import { TimerProvider } from "./contexts/TimerContext";
import { Toaster } from 'sonner';

function App() {
  return (
    <Router >
      <Navbar />
      <TimerProvider>
        <Toaster position="top-center" expand={false} richColors />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={< AuthPage />} />
            <Route path="/User" element={<ClockInOut />} />
            <Route path="/ManagerDashboard" element={<ManagerDashboard />} />

          </Routes>
        </div>
      </TimerProvider>

    </Router>
  );
}

export default App;