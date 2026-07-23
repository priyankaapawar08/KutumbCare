// src/pages/Appointments.tsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addAppointment, getAppointments, deleteAppointment } from "../services/appointmentService";
import { getFamilyMembers, FamilyMember } from "../services/familyService";

// Appointment interface for frontend
export interface Appointment {
  _id: string;
  member: FamilyMember;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [families, setFamilies] = useState<FamilyMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    member: "",
    title: "",
    doctor: "",
    date: "",
    time: "",
    location: "",
    notes: ""
  });

  // Fetch appointments & family members
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // ✅ Load appointments independently
      try {
        console.log('🟡 Fetching appointments...');
        const apptRes = await getAppointments();
        console.log('✅ Appointments received:', apptRes);
        setAppointments(apptRes);
      } catch (err) {
        console.error('❌ Failed to load appointments:', err);
        toast.error("Failed to load appointments");
      }

      // ✅ Load family members independently
      try {
        const familyRes = await getFamilyMembers();
        if (familyRes.success) setFamilies(familyRes.members);
      } catch (err) {
        console.error('❌ Failed to load family members:', err);
        toast.error("Failed to load family members");
      }

      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Find actual FamilyMember object
    const selectedMember = families.find(f => f._id === formData.member);
    if (!selectedMember) return toast.error("Please select a valid family member");

    try {
      setIsSubmitting(true);
      const newAppt = await addAppointment({
        member: selectedMember,
        title: formData.title,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        notes: formData.notes
      });

      setAppointments(prev => [newAppt, ...prev]);
      toast.success("Appointment added successfully");
      setShowForm(false);
      setFormData({
        member: "",
        title: "",
        doctor: "",
        date: "",
        time: "",
        location: "",
        notes: ""
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to add appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (_id: string, title: string) => {
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(_id);
      await deleteAppointment(_id);
      setAppointments(prev => prev.filter(a => a._id !== _id));
      toast.success("✅ Appointment deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "❌ Failed to delete appointment");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-500">Manage your family's doctor appointments</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Appointment</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg mb-6 border-2 border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Member *</label>
            <select
              name="member"
              value={formData.member}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Family Member --</option>
              {families.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.relation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Dental Checkup"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
            <input
              type="text"
              name="doctor"
              placeholder="Doctor's name"
              value={formData.doctor}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Clinic/Hospital address"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {isSubmitting ? "Adding..." : "Add Appointment"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4 opacity-30">📅</div>
            <p className="text-gray-500 text-lg font-medium">No appointments scheduled</p>
          </div>
        ) : (
          appointments.map(a => (
            <div
              key={a._id}
              className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      📅
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{a.title}</h3>
                      <p className="text-sm text-gray-500">For: {a.member?.name || 'Unknown member'}</p>
                    </div>
                  </div>
                  <div className="ml-14 space-y-1 text-sm text-gray-700">
                    <p>👨‍⚕️ Doctor: <span className="font-medium">{a.doctor}</span></p>
                    <p>🗓️ {a.date} at {a.time}</p>
                    {a.location && <p>📍 {a.location}</p>}
                    {a.notes && <p className="italic text-gray-600">📝 {a.notes}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a._id, a.title)}
                  disabled={deletingId === a._id}
                  className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all border-2 border-red-200 hover:border-red-600 disabled:opacity-50"
                  title="Delete appointment"
                >
                  {deletingId === a._id ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "🗑️"
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments;