import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const demoCredentials = [
    { 
      email: "user@example.com", 
      password: "password123", 
      label: "👤 User Account",
      color: "from-blue-500 to-blue-600"
    },
    { 
      email: "admin@kutumbcare.com", 
      password: "admin123", 
      label: "👑 Admin Account",
      color: "from-purple-500 to-purple-600"
    },
    { 
      email: "parent@example.com", 
      password: "parent123", 
      label: "👪 Parent Account",
      color: "from-green-500 to-green-600"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const data = await login(email, password);
    
    if (data.success && data.token && data.user) {
      // Save to localStorage only if token and user exist
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  } catch (err: any) {
    setError(err.message || "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className={`relative w-full max-w-6xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Illustration */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 md:p-12 text-white">
            <div className="flex flex-col h-full justify-center items-center text-center">
              <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">KutumbCare</h1>
                <p className="text-blue-100 text-lg md:text-xl">Your Family's Health, Our Priority</p>
              </div>
              
              <div className="space-y-6 mt-8">
                <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl">💊</div>
                  <p className="text-left">Track medications & health records</p>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl">📊</div>
                  <p className="text-left">Monitor vital signs & health trends</p>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl">👨‍⚕️</div>
                  <p className="text-left">Family health management made easy</p>
                </div>
              </div>

              {/* Floating Icons */}
              <div className="absolute bottom-8 left-8 text-3xl animate-bounce">❤️</div>
              <div className="absolute top-8 right-8 text-2xl animate-pulse">🌡️</div>
              <div className="absolute top-1/2 left-4 text-xl animate-bounce animation-delay-1000">💉</div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="md:w-1/2 p-8 md:p-12">
            <div className={`transition-all duration-700 delay-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h2>
              <p className="text-gray-600 mb-8">Sign in to manage your family's health</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center space-x-2 animate-shake">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                    <div className="absolute right-4 top-4 text-gray-400">📧</div>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm pr-12"
                    />
                    <div className="absolute right-4 top-4 text-gray-400">🔒</div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full p-4 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>Sign In</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Quick Access</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => fillDemoCredentials(cred.email, cred.password)}
                      className={`w-full p-3 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${cred.color} shadow-md hover:shadow-lg flex items-center justify-center space-x-2`}
                    >
                      <span>{cred.label.split(' ')[0]}</span>
                      <span>{cred.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  New to KutumbCare?{" "}
                  <Link 
                    to="/signup" 
                    className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-300"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-xs text-green-700 flex items-center justify-center space-x-1">
                  <span>🔒</span>
                  <span>Your data is securely stored in MongoDB Atlas</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}