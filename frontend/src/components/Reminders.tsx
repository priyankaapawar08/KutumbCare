import React from 'react';

// We must define the types for the data this component will receive
// This is based on the data from your 'familyService.ts'
interface Member {
  _id: string; // Add _id here
  name: string;
  relation: string;
}
// This is based on your 'appointmentService.ts'
export interface Appointment {
  _id: string;
  title: string;
  time: string;
  date: string; // We'll use this to filter for today
  member: Member; // This component expects the populated member object
}

// Define the props (properties) for this component
interface RemindersProps {
  appointments: Appointment[]; // It expects a full list of appointments
}

const Reminders: React.FC<RemindersProps> = ({ appointments }) => {
  
  // --- Data Filtering ---
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter the full appointment list to find only today's
  const todaysAppointments = appointments.filter(app => {
    // Re-format the date from the database to match our 'today' string
    const appDate = new Date(app.date).toISOString().split('T')[0];
    return appDate === today;
  });

  // --- Render ---
  return (
    <div className="reminders-widget" style={{ marginTop: '20px' }}>
      <h4>Today's Reminders</h4>
      
      {/* This is an if/else check:
        IF todaysAppointments.length is 0, show <p>...
        ELSE show <ul>...
      */}
      {todaysAppointments.length === 0 ? (
        <p>No appointments scheduled for today. ✨</p>
      ) : (
        <ul className="reminder-list" style={{ listStyle: 'none', paddingLeft: 0, marginTop: '10px' }}>
          {todaysAppointments.map(app => (
            <li key={app._id} style={{ marginBottom: '8px', padding: '5px', background: '#f0f0f0', borderRadius: '4px' }}>
              <strong>{app.time}</strong> - {app.title} 
              (<strong>{app.member.name}</strong>)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reminders;