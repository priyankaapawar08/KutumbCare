import React from "react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">About KutumbCare</h1>
      <p className="text-gray-600 text-lg mb-6 max-w-2xl text-center">
        KutumbCare is a complete family health management solution designed to help you
        track vital health metrics, manage medications, schedule appointments, and maintain
        the overall wellness of your loved ones—all in one place. Our mission is to make
        family healthcare simple, accessible, and stress-free.
      </p>
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Why Choose KutumbCare?</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>Track health trends and analytics for your family.</li>
          <li>Receive smart medication reminders.</li>
          <li>Manage doctor appointments and schedules.</li>
          <li>Secure and easy-to-use platform for all family members.</li>
        </ul>
      </div>
    </div>
  );
}
