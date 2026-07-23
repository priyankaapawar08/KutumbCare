import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export interface AppointmentForNotif {
  _id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
  member: { name: string };
}

const useAppointmentNotifications = (appointments: AppointmentForNotif[]) => {
  const notifiedIds = useRef<Set<string>>(new Set());

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!appointments.length) return;

    const checkNotifications = () => {
      const now = new Date();

      appointments.forEach(appt => {
        if (notifiedIds.current.has(appt._id)) return;

        // Parse appointment datetime
        const apptDate = new Date(appt.date);
        const [timePart, modifier] = appt.time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        apptDate.setHours(hours, minutes, 0, 0);

        const diffMs = apptDate.getTime() - now.getTime();
        const diffMins = diffMs / 1000 / 60;

        // Notify if between 55 and 65 minutes away (1hr window)
        if (diffMins > 55 && diffMins <= 65) {
          notifiedIds.current.add(appt._id);

          // In-app toast
          toast(`⏰ Reminder: "${appt.title}" for ${appt.member.name} with Dr. ${appt.doctor} is in 1 hour!`, {
            duration: 8000,
            icon: '🏥',
          });

          // Browser push notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('KutumbCare - Appointment Reminder 🏥', {
              body: `"${appt.title}" for ${appt.member.name} with Dr. ${appt.doctor} is in 1 hour!`,
              icon: '/logo192.png',
            });
          }
        }
      });
    };

    // Check immediately, then every minute
    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 1000);

    return () => clearInterval(interval);
  }, [appointments]);
};

export default useAppointmentNotifications;