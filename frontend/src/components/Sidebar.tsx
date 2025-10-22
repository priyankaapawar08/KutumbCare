import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-gray-100 w-60 p-4 min-h-screen">
      <h2 className="font-bold mb-4">Menu</h2>
      <ul className="space-y-2">
        <li><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
        <li><Link to="/profile" className="hover:text-blue-600">Profile</Link></li>
        <li><Link to="/records" className="hover:text-blue-600">Records</Link></li>
        <li><Link to="/medications" className="hover:text-blue-600">Medications</Link></li>
        <li><Link to="/vitals" className="hover:text-blue-600">Vitals</Link></li>
      </ul>
    </div>
  );
}
