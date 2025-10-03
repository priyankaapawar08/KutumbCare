import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      console.log(res.data);
      navigate("/dashboard");
    } catch (err) {
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Signup
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}
