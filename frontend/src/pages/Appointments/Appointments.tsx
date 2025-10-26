import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addAppointment, getAppointments } from '../../services/appointmentService';
import { getFamilyMembers, FamilyMember } from '../../services/familyService';

// Define Appointment shape
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
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [families, setFamilies] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form state ---
  const [member, setMember] = useState('');
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // --- Load data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch appointments and family members safely
        const [apptsData, familiesData] = await Promise.all([
          getAppointments().catch(() => []),
          getFamilyMembers().catch(() => ({ success: false, members: [] })),
        ]);

        setAppointments(apptsData || []);

        if (familiesData && familiesData.success) {
          setFamilies(familiesData.members || []);
        } else {
          toast.error('Failed to load family members');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Handle form submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return toast.error('Please select a family member.');

    setIsSubmitting(true);

    let formattedTime = '12:00 AM';
    if (time) {
      const [hourStr, minute] = time.split(':');
      const hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      formattedTime = `${formattedHour}:${minute} ${ampm}`;
    }

    try {
      const newAppointmentData = { 
  member: member,  // This is the member ID (string)
  title, 
  doctor, 
  date, 
  time: formattedTime, 
  location, 
  notes 
};
const newAppointment = await addAppointment(newAppointmentData as any);
      const memberDetails = families.find(f => f._id === member);
      if (memberDetails) {
        setAppointments(prev => [{ ...newAppointment, member: memberDetails }, ...prev]);
      }

      toast.success('Appointment added successfully!');
      setShowForm(false);

      // Clear form
      setMember('');
      setTitle('');
      setDoctor('');
      setDate('');
      setTime('');
      setLocation('');
      setNotes('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Form JSX ---
  const renderForm = () => (
    <div className="add-data-form">
      <h2>Add Appointment</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Family Member *</label>
          <select value={member} onChange={e => setMember(e.target.value)} required>
            <option value="">-- Select Family Member --</option>
            {families.map(f => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.relation}, {f.age}y)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Appointment Title *</label>
          <input type="text" placeholder="Regular Checkup" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Doctor *</label>
          <input type="text" placeholder="Dr. Sharma" value={doctor} onChange={e => setDoctor(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Time *</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Location (Optional)</label>
          <input type="text" placeholder="City Hospital" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div className="form-group full-width">
          <label>Notes (Optional)</label>
          <textarea placeholder="Bring old reports" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Appointment'}
          </button>
          <button type="button" className="btn btn-cancel" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  // --- List JSX ---
  const renderList = () => (
    <div className="data-list">
      {appointments.length === 0 ? (
        <div className="empty-state">
          <h3>No appointments scheduled</h3>
          <p>Add appointments for your family members</p>
        </div>
      ) : (
        <div className="appointment-list-cards">
          {appointments.map(app => (
            <div className="card appointment-card" key={app._id}>
              <h4>{app.title}</h4>
              <p>For: <strong>{app.member.name}</strong></p>
              <p>With: <strong>Dr. {app.doctor}</strong></p>
              <p>
                On: <strong>{new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{app.time}</strong>
              </p>
              {app.location && <p>At: {app.location}</p>}
              {app.notes && <p className="notes">Notes: {app.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="page-layout">
        <main className="page-content">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <main className="page-content" style={{ padding: '20px' }}>
        <div className="page-header">
          <h1>Appointments</h1>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add Appointment
            </button>
          )}
        </div>

        {showForm ? renderForm() : renderList()}
      </main>
    </div>
  );
};

export default Appointments;
