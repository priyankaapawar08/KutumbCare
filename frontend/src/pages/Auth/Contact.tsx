import React from "react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
      <p className="text-gray-600 text-lg mb-6">
        Reach out to us at <span className="font-semibold">support@kutumbcare.com</span> or call us at <span className="font-semibold">+91 12345 67890</span>
      </p>
      <form className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
        />
        <textarea
          placeholder="Your Message"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
          rows={4}
        ></textarea>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
