import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Toast notifications

// Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Auth/Dashboard";
import MemberProfile from "./pages/Auth/MemberProfile";
import Appointments from "./pages/Appointments"; // <-- Directly from pages

export default function App() {
  return (
    <Router>
      {/* Toast notifications at root */}
      <Toaster position="top-right" />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/member/:memberId" element={<MemberProfile />} />
        <Route path="/appointments" element={<Appointments />} /> {/* Added Appointments page */}
      </Routes>
    </Router>
  );
}
