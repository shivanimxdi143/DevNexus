import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/api";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    age: "",
    gender: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (Object.values(formData).some((value) => !value.toString().trim())) {
      setMessage("Please fill all the fields.");
      setMessageType("error");
      return;
    }

    if (Number(formData.age) < 18) {
      setMessage("You must be at least 18 years old.");
      setMessageType("error");
      return;
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!strongPassword.test(formData.password)) {
      setMessage("Password must contain uppercase, lowercase, number and special character.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/signup`, {
        ...formData,
        age: Number(formData.age)
      });

      setMessage("Account created successfully! Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      setMessage(
        err.response?.data || "Signup failed. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#151923]">
      <div className="max-w-xl w-full rounded-3xl overflow-hidden glass-card shadow-2xl border border-[#2B3449] p-8 sm:p-10 bg-[#1B2130]/95">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B83F7] via-[#55B8E8] to-[#E69AB5] flex items-center justify-center text-[#151923] font-black text-lg mx-auto mb-3 shadow-lg shadow-[#8B83F7]/30">
            DN
          </div>
          <h1 className="text-2xl font-extrabold text-[#F1F2F8] tracking-tight">
            Join the Developer Network
          </h1>
          <p className="text-sm text-[#A5AEC0] mt-1">
            Create your account and start connecting with developers
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              messageType === "success"
                ? "bg-[#55B8E8]/15 border-[#55B8E8]/30 text-[#55B8E8]"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <span>{messageType === "success" ? "✓" : "⚠"}</span>
            <span>{message}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
              required
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars with upper, lower, number, special"
              className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                Age
              </label>
              <input
                type="number"
                name="age"
                min="18"
                value={formData.age}
                onChange={handleChange}
                placeholder="18+"
                className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                required
              >
                <option value="" className="bg-[#1B2130] text-[#A5AEC0]">Select gender</option>
                <option value="male" className="bg-[#1B2130]">Male</option>
                <option value="female" className="bg-[#1B2130]">Female</option>
                <option value="others" className="bg-[#1B2130]">Others</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-[#8B83F7]/30 hover:opacity-95 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>

        </form>

        <p className="mt-8 text-center text-xs text-[#A5AEC0]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#55B8E8] font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
