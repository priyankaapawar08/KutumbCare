import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Chart from "../../components/Chart";
import { formatDate } from "../../utils/formatters";

const mockFamily = [
  { id: 1, name: "John Doe", age: 35, relation: "Father" },
  { id: 2, name: "Jane Doe", age: 33, relation: "Mother" },
  { id: 3, name: "Mike Doe", age: 10, relation: "Son" }
];

const vitalsData = [
  { date: "2025-09-25", value: 120 },
  { date: "2025-09-26", value: 125 },
  { date: "2025-09-27", value: 130 },
  { date: "2025-09-28", value: 128 },
  { date: "2025-09-29", value: 122 }
];

const recentActivities = [
  { activity: "Blood Pressure recorded", member: "John Doe", time: "2 hours ago" },
  { activity: "Medication taken", member: "Jane Doe", time: "5 hours ago" },
  { activity: "Appointment scheduled", member: "Mike Doe", time: "1 day ago" },
  { activity: "Vital signs updated", member: "John Doe", time: "2 days ago" }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "User";
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleMemberClick = (member: any) => {
    alert(`Viewing details for ${member.name} (${member.relation})`);
    // Later: navigate(`/member/${member.id}`)
  };

  const handleAddVital = () => {
    setShowAddVitalModal(true);
    // Later: Open modal or navigate to add vital page
    setTimeout(() => {
      setShowAddVitalModal(false);
      alert("Vital recorded successfully!");
    }, 1000);
  };

  const handleAddMedication = () => {
    alert("Add Medication - Coming soon!");
    // Later: navigate("/add-medication")
  };

  const handleScheduleAppointment = () => {
    alert("Schedule Appointment - Coming soon!");
    // Later: navigate("/schedule-appointment")
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout */}
      <div className="bg-white shadow-sm p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">KutumbCare</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back, {userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Family Dashboard</h2>

        {/* Family Members Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Family Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockFamily.map((member) => (
              <div
                key={member.id}
                onClick={() => handleMemberClick(member)}
                className="cursor-pointer transform hover:scale-105 transition-transform"
              >
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xl">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{member.name}</h4>
                      <p className="text-gray-600 text-sm">{member.relation} • {member.age} yrs</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleAddVital}
              className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-lg">Add Vital</div>
              <div className="text-sm opacity-90">Record health metrics</div>
            </button>
            <button
              onClick={handleAddMedication}
              className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <div className="text-3xl mb-2">💊</div>
              <div className="font-bold text-lg">Add Medication</div>
              <div className="text-sm opacity-90">Track medicines</div>
            </button>
            <button
              onClick={handleScheduleAppointment}
              className="bg-purple-500 text-white p-6 rounded-lg hover:bg-purple-600 transition-colors shadow-md"
            >
              <div className="text-3xl mb-2">📅</div>
              <div className="font-bold text-lg">Schedule Appointment</div>
              <div className="text-sm opacity-90">Book doctor visit</div>
            </button>
          </div>
        </div>

        {/* Health Summary Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Health Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Active Medications" value="3" />
            <Card title="Vitals Recorded Today" value="5" />
            <Card title="Upcoming Appointments" value="1" />
          </div>
        </div>

        {/* Vitals Trend Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Blood Pressure Trend</h3>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Chart data={vitalsData} title="Last 5 Days" yLabel="BP (mmHg)" />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Activities</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            {recentActivities.map((item, index) => (
              <div
                key={index}
                className="border-b py-4 last:border-b-0 hover:bg-gray-50 transition-colors px-2 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.activity}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.member} • <span className="text-blue-500">{item.time}</span>
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Checkup Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Last Family Checkup</h3>
          <Card title="Last Checkup Date" value={formatDate("2025-09-30")} />
        </div>
      </div>

      {/* Simple Modal for Add Vital */}
      {showAddVitalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="font-semibold">Recording vital...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}