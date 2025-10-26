// utils/scheduleReminders.js
const schedule = require("node-schedule");
const sendEmail = require("./sendEmail");

const scheduleAppointmentReminder = (appointment) => {
  const [hour, minute] = appointment.time.split(":").map(Number);
  const [year, month, day] = appointment.date.split("-").map(Number);

  // JS months start from 0
  const appointmentDate = new Date(year, month - 1, day, hour, minute);

  // 1 hour before
  const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
  schedule.scheduleJob(oneHourBefore, () => {
    sendEmail(
      appointment.memberEmail,
      `Reminder: ${appointment.title} in 1 hour`,
      `Hi ${appointment.memberName}, your appointment with Dr.${appointment.doctor} is in 1 hour at ${appointment.time} on ${appointment.date}`
    );
  });

  // At exact time
  schedule.scheduleJob(appointmentDate, () => {
    sendEmail(
      appointment.memberEmail,
      `Appointment Now: ${appointment.title}`,
      `Hi ${appointment.memberName}, your appointment with Dr.${appointment.doctor} is happening now.`
    );
  });
};

module.exports = scheduleAppointmentReminder;
