import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Auth/Dashboard";
import Profile from "../pages/Profile/Profile";
import RecordsList from "../pages/Records/RecordsList";
import UploadRecord from "../pages/Records/UploadRecord";
import MedicationList from "../pages/Medications/MedicationList";
import AddMedication from "../pages/Medications/AddMedication";
import VitalsList from "../pages/Vitals/VitalsList";
import AddVitals from "../pages/Vitals/AddVitals";
import Contact from "../pages/Auth/Contact"; 
import About from "../pages/Auth/About"; 
import Features from "../pages/Auth/Features";
import MemberProfile from "../pages/Auth/MemberProfile";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/records" element={<RecordsList />} />
      <Route path="/upload-record" element={<UploadRecord />} />
      <Route path="/medications" element={<MedicationList />} />
      <Route path="/add-medication" element={<AddMedication />} />
      <Route path="/vitals" element={<VitalsList />} />
      <Route path="/add-vitals" element={<AddVitals />} />
      <Route path="/member/:id" element={<MemberProfile />} />
    </Routes>
  );
}
