import React from "react";

export default function Features() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Features of KutumbCare</h1>
      <p className="text-gray-600 text-lg mb-6 max-w-2xl text-center">
        KutumbCare provides a wide range of tools to make family health management
        easier, smarter, and more organized. Explore our key features below.
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Health Analytics 📊</h2>
          <p className="text-gray-600 text-sm">
            Track and visualize health trends over time for every family member.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Medication Tracker 💊</h2>
          <p className="text-gray-600 text-sm">
            Get reminders and never miss a dose for yourself or your family.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Family Profiles 👨‍👩‍👧‍👦</h2>
          <p className="text-gray-600 text-sm">
            Manage health data for all your family members in one place.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Appointments 📅</h2>
          <p className="text-gray-600 text-sm">
            Schedule and track doctor visits easily.
          </p>
        </div>
      </div>
    </div>
  );
}
