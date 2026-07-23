import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addAppointment, getAppointments, deleteAppointment } from '../../services/appointmentService';
import { getFamilyMembers, FamilyMember } from '../../services/familyService';
import useAppointmentNotifications from '../../hooks/useAppointmentNotifications';

export interface Appointment {
  _id: string;
  member: FamilyMember;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  status?: string;
}

const Appointments: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [families, setFamilies] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [member, setMember] = useState('');
  const [title, setTitle] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // ✅ Hook for 1hr notifications
  useAppointmentNotifications(appointments);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [apptsData, familiesData] = await Promise.all([
          getAppointments().catch(() => []),
          getFamilyMembers().catch(() => ({ success: false, members: [] }))
        ]);
        setAppointments(apptsData || []);
        if (familiesData?.success) setFamilies(familiesData.members || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return toast.error('Please select a family member.');

    setIsSubmitting(true);
    try {
      // Send time as 24hr to backend, display formatted
      const newAppt = await addAppointment({ member, title, doctor, date, time, location, notes });
      const memberDetails = families.find(f => f._id === member);
      setAppointments(prev => [{ ...newAppt, member: memberDetails || newAppt.member }, ...prev]);
      toast.success('Appointment added!');
      setShowForm(false);
      setMember(''); setTitle(''); setDoctor('');
      setDate(''); setTime(''); setLocation(''); setNotes('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a._id !== id));
      toast.success('Appointment deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === 'completed') return '#22c55e';
    if (status === 'cancelled') return '#ef4444';
    return '#3b82f6';
  };

  if (loading) return <div className="page-layout"><main className="page-content"><p>Loading...</p></main></div>;

  return (
    <div className="page-layout">
      <main className="page-content" style={{ padding: '20px' }}>
        <div className="page-header">
          <div>
            <h1>Appointments</h1>
            <p style={{ color: '#6b7280', marginTop: 4 }}>Manage your family's health appointments</p>
          </div>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add Appointment
            </button>
          )}
        </div>

        {showForm && (
          <div className="add-data-form">
            <h2>Add Appointment</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Family Member *</label>
                <select value={member} onChange={e => setMember(e.target.value)} required>
                  <option value="">-- Select --</option>
                  {families.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.relation})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Title *</label>
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
                <label>Location</label>
                <input type="text" placeholder="City Hospital" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea placeholder="Bring old reports..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="form-actions full-width">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Appointment'}
                </button>
                <button type="button" className="btn btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="data-list" style={{ marginTop: 20 }}>
          {appointments.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>📅</div>
              <h3>No appointments scheduled yet</h3>
              <p>Schedule appointments for your family members</p>
            </div>
          ) : (
            <div className="appointment-list-cards">
              {appointments.map(appt => (
                <div className="card appointment-card" key={appt._id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4>{appt.title}</h4>
                    <span style={{
                      background: getStatusColor(appt.status),
                      color: '#fff', borderRadius: 12,
                      padding: '2px 10px', fontSize: 12
                    }}>
                      {appt.status || 'scheduled'}
                    </span>
                  </div>
                  <p>👤 <strong>{appt.member?.name}</strong></p>
                  <p>🩺 Dr. {appt.doctor}</p>
                  <p>📅 {new Date(appt.date).toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })} at ⏰ {appt.time}</p>
                  {appt.location && <p>📍 {appt.location}</p>}
                  {appt.notes && <p style={{ color: '#6b7280', fontSize: 13 }}>📝 {appt.notes}</p>}
                  <button
                    onClick={() => handleDelete(appt._id)}
                    style={{ marginTop: 8, background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Appointments;