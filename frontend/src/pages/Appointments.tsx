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
      try {
        setLoading(true);
        const [apptRes, familyRes] = await Promise.all([
          getAppointments(),
          getFamilyMembers()
        ]);
        setAppointments(apptRes);
        if (familyRes.success) setFamilies(familyRes.members);
      } catch (err) {
        toast.error("Failed to load appointments or family members");
      } finally {
        setLoading(false);
      }
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
  const handleDelete = async (_id: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointment(_id);
      setAppointments(prev => prev.filter(a => a._id !== _id));
      toast.success("Appointment deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete appointment");
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="appointments-page" style={{ padding: "20px" }}>
      <h1>Appointments</h1>
      {!showForm && (
        <button onClick={() => setShowForm(true)}>+ Add Appointment</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ margin: "20px 0" }}>
          <select name="member" value={formData.member} onChange={handleChange} required>
            <option value="">-- Select Family Member --</option>
            {families.map(f => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.relation})
              </option>
            ))}
          </select>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
          <input type="text" name="doctor" placeholder="Doctor" value={formData.doctor} onChange={handleChange} required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
          <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</button>
          <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      <div className="appointments-list" style={{ marginTop: "20px" }}>
        {appointments.length === 0 ? (
          <p>No appointments scheduled</p>
        ) : (
          appointments.map(a => (
            <div key={a._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
              <h3>{a.title}</h3>
              <p>For: {a.member.name}</p>
              <p>Doctor: {a.doctor}</p>
              <p>Date: {a.date} at {a.time}</p>
              {a.location && <p>Location: {a.location}</p>}
              {a.notes && <p>Notes: {a.notes}</p>}
              <button onClick={() => handleDelete(a._id)} style={{ color: "red" }}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments;
