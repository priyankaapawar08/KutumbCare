import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    
    const validUsers = [
      { email: "admin@family.com", password: "admin123", role: "Admin" },
      { email: "dad@family.com", password: "dad123", role: "Parent" },
      { email: "mom@family.com", password: "mom123", role: "Parent" },
      { email: "test@test.com", password: "test123", role: "Member" }
    ];

    await new Promise(resolve => setTimeout(resolve, 800));

    const user = validUsers.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", user.role);
      navigate("/dashboard");
    } else {
      alert("Wrong credentials!\n\nTry:\nadmin@family.com / admin123");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KutumbCare
              </h1>
              <p className="text-xs text-gray-500">Family Health Tracker</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              About
            </button>
            <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Features
            </button>
            <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Contact
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Welcome to
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  KutumbCare
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your complete family health management solution. Track vitals, manage medications, and keep your loved ones healthy - all in one place.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Health Analytics</h3>
                <p className="text-sm text-gray-600">Track and visualize health trends over time</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">💊</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Medication Tracker</h3>
                <p className="text-sm text-gray-600">Never miss a dose with smart reminders</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-pink-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Family Profiles</h3>
                <p className="text-sm text-gray-600">Manage health data for entire family</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Appointments</h3>
                <p className="text-sm text-gray-600">Schedule and track doctor visits</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-6">
              <div>
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-sm text-gray-600">Families Trust Us</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">10K+</p>
                <p className="text-sm text-gray-600">Health Records</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-600">99%</p>
                <p className="text-sm text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                
                {/* Form Header */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <span className="text-3xl">🔐</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                  <p className="text-gray-500 mt-2">Access your family health dashboard</p>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-xl">📧</span>
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-xl">🔒</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Demo Access</span>
                  </div>
                </div>

                {/* Demo Credentials */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🔑</span>
                    <p className="font-bold text-green-700">Test Credentials</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2.5 flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-blue-600">admin@family.com</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 flex justify-between">
                      <span className="text-gray-600">Password:</span>
                      <span className="font-semibold text-blue-600">admin123</span>
                    </div>
                  </div>
                </div>

                {/* Signup Link */}
                <div className="text-center pt-2">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <button
                      onClick={() => navigate("/signup")}
                      className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      Create one now →
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 KutumbCare. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <button className="hover:text-blue-600 transition-colors">Privacy Policy</button>
              <button className="hover:text-blue-600 transition-colors">Terms of Service</button>
              <button className="hover:text-blue-600 transition-colors">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}