import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../config/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post(
        `${BASE_URL}/login`,
        {
          emailId: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      const res = await axios.get(
        `${BASE_URL}/profile/view`,
        {
          withCredentials: true,
        }
      );

      dispatch(addUser(res.data));
      navigate("/feed");

      alert("Login successful!");
    } catch (err) {
      console.log(err);
      const errText = err.response?.data || "Something went wrong";
      setErrorMessage(typeof errText === "string" ? errText : "Login failed. Please check credentials.");
      alert(errText);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#151923]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden glass-card shadow-2xl border border-[#2B3449]">
        
        {/* Left: Branding & Value Prop */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#1B2130] via-[#222A3B] to-[#151923] relative border-r border-[#2B3449]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B83F7] via-[#55B8E8] to-[#E69AB5] flex items-center justify-center text-[#151923] font-black text-sm shadow-md shadow-[#8B83F7]/30">
                DN
              </div>
              <span className="text-xl font-bold text-[#F1F2F8] tracking-tight">DevNexus</span>
            </div>

            <h2 className="text-3xl font-extrabold text-[#F1F2F8] leading-tight mb-4">
              Connect. Collaborate. <br />
              <span className="gradient-aurora-text">Build Together.</span>
            </h2>

            <p className="text-[#A5AEC0] text-sm leading-relaxed mb-6">
              The premier social networking platform designed exclusively for developers. Discover peers, showcase your technical skills, and build meaningful connections.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#F1F2F8]">
                <span className="w-5 h-5 rounded-full bg-[#8B83F7]/20 text-[#8B83F7] flex items-center justify-center text-xs font-bold">✓</span>
                <span>Discover developers matching your exact tech stack</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#F1F2F8]">
                <span className="w-5 h-5 rounded-full bg-[#55B8E8]/20 text-[#55B8E8] flex items-center justify-center text-xs font-bold">✓</span>
                <span>Direct real-time messaging & collaboration pitch</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#F1F2F8]">
                <span className="w-5 h-5 rounded-full bg-[#D9B875]/20 text-[#D9B875] flex items-center justify-center text-xs font-bold">✓</span>
                <span>Verified developer profiles & interactive skills</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2B3449] text-xs text-[#737D92] relative z-10">
            Trusted by developers and creators worldwide.
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 -left-20 w-64 h-64 bg-[#8B83F7]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 -right-20 w-64 h-64 bg-[#55B8E8]/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Right: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-[#1B2130]/95">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#F1F2F8] tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-[#A5AEC0] mt-1">
              Sign in to your DevNexus developer account
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#8B83F7] hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-[#8B83F7]/30 hover:opacity-95 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-[#A5AEC0]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#55B8E8] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
