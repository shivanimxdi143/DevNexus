import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { addUser, removeUser } from "../redux/userSlice";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

function Navbar() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Evaluate premium status directly from user state in Redux
  const isPremiumUser = Boolean(user?.isPremium || user?.premium?.isActive);

  const [isPremium, setIsPremium] = useState(isPremiumUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronize state immediately if Redux user state updates
  useEffect(() => {
    if (isPremiumUser) {
      setIsPremium(true);
    }
  }, [isPremiumUser]);

  // Query backend /payment/status for live verification
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchPremiumStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/payment/status`, {
          withCredentials: true,
        });

        if (!isMounted) return;

        const active = Boolean(res.data?.isActive || isPremiumUser);
        setIsPremium(active);

        if (res.data?.isActive && !user?.premium?.isActive) {
          dispatch(
            addUser({
              ...user,
              isPremium: true,
              premium: {
                ...user.premium,
                isActive: true,
                plan: res.data.plan,
                expiryDate: res.data.expiryDate,
                startDate: res.data.startDate,
              },
            })
          );
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch Premium status:", err);
        setIsPremium(isPremiumUser);
      }
    };

    fetchPremiumStatus();

    return () => {
      isMounted = false;
    };
  }, [user, isPremiumUser, dispatch]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );

      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!user) return null;

  const userDisplayName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const userPhoto = getDeveloperAvatar(user);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
      isActive
        ? "text-[#F1F2F8] bg-[#222A3B] border border-[#8B83F7]/40 shadow-sm shadow-[#8B83F7]/10"
        : "text-[#A5AEC0] hover:text-[#F1F2F8] hover:bg-[#222A3B]/50"
    }`;

  const isDiscoverActive = location.pathname === "/feed" && location.search.includes("mode=discover");
  const isFeedActive = location.pathname === "/feed" && !location.search.includes("mode=discover");

  return (
    <>
      <header className="sticky top-0 z-50 glass-nav border-b border-[#2B3449] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <NavLink
              to="/feed"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B83F7] via-[#55B8E8] to-[#E69AB5] flex items-center justify-center text-[#151923] shadow-md shadow-[#8B83F7]/25 group-hover:scale-105 transition-transform duration-200">
                <span className="font-black text-sm tracking-wider">DN</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F1F2F8] flex items-center gap-1.5">
                <span>DevNexus</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#222A3B] text-[#8B83F7] border border-[#8B83F7]/30">
                  SOCIAL
                </span>
              </span>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              <NavLink 
                to="/feed" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                  isFeedActive
                    ? "text-[#F1F2F8] bg-[#222A3B] border border-[#8B83F7]/40 shadow-sm shadow-[#8B83F7]/10"
                    : "text-[#A5AEC0] hover:text-[#F1F2F8] hover:bg-[#222A3B]/50"
                }`}
              >
                <svg className="w-4 h-4 text-[#8B83F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Feed</span>
              </NavLink>

              <NavLink 
                to="/feed?mode=discover" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                  isDiscoverActive
                    ? "text-[#F1F2F8] bg-[#222A3B] border border-[#55B8E8]/40 shadow-sm shadow-[#55B8E8]/10"
                    : "text-[#A5AEC0] hover:text-[#F1F2F8] hover:bg-[#222A3B]/50"
                }`}
              >
                <svg className="w-4 h-4 text-[#55B8E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Discover</span>
              </NavLink>

              <NavLink to="/connections" className={navLinkClass}>
                <svg className="w-4 h-4 text-[#8B83F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Connections</span>
              </NavLink>

              <NavLink to="/chat" className={navLinkClass}>
                <svg className="w-4 h-4 text-[#55B8E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Chat</span>
              </NavLink>

              <NavLink to="/requests" className={navLinkClass}>
                <svg className="w-4 h-4 text-[#8B83F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Requests</span>
              </NavLink>

              <NavLink to="/message-requests" className={navLinkClass}>
                <svg className="w-4 h-4 text-[#E69AB5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Inbox</span>
              </NavLink>
            </nav>
          </div>

          {/* Right Section: Premium Status Pill + User Avatar Menu */}
          <div className="flex items-center gap-3">
            
            {/* Premium Status Pill */}
            <NavLink
              to="/premium"
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                isPremium
                  ? "bg-[#D9B875]/15 text-[#D9B875] border-[#D9B875]/45 hover:bg-[#D9B875]/25 shadow-sm shadow-[#D9B875]/20 ring-1 ring-[#D9B875]/30"
                  : "bg-[#222A3B] text-[#55B8E8] border border-[#55B8E8]/40 hover:bg-[#2B3449] shadow-sm shadow-[#55B8E8]/10"
              }`}
            >
              <span>{isPremium ? "👑 Premium Active" : "⭐ Get Premium"}</span>
            </NavLink>

            {/* User Name (Desktop) */}
            <span className="hidden xl:inline-block text-sm font-semibold text-[#F1F2F8]">
              {userDisplayName}
            </span>

            {/* User Profile Dropdown Menu */}
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                type="button"
                role="button"
                aria-label="User Profile"
                className={`btn btn-ghost btn-circle avatar border transition-all focus:outline-none ${
                  isPremium
                    ? "border-[#D9B875]/70 shadow-md shadow-[#D9B875]/20 hover:border-[#D9B875]"
                    : "border-[#2B3449] hover:border-[#8B83F7]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full overflow-hidden ${
                    isPremium
                      ? "ring-2 ring-[#D9B875]/80 ring-offset-1 ring-offset-[#151923]"
                      : "ring-1 ring-[#8B83F7]/30"
                  }`}
                >
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                </div>
              </button>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-[#1B2130] text-[#F1F2F8] rounded-2xl z-50 w-64 p-3 shadow-2xl border border-[#2B3449] mt-3 space-y-1"
              >
                <li className="menu-title px-3 py-2 border-b border-[#2B3449] mb-1">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F1F2F8] font-semibold text-sm truncate">
                        {userDisplayName}
                      </span>
                      {isPremium && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D9B875]/20 text-[#D9B875] border border-[#D9B875]/40">
                          👑 VIP
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#A5AEC0] font-normal truncate">
                      {user.emailId}
                    </span>
                  </div>
                </li>

                <li>
                  <NavLink to="/feed" className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#222A3B] text-[#A5AEC0] hover:text-[#F1F2F8]">
                    <span>🚀</span>
                    <span>Dashboard / Feed</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/profile" className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#222A3B] text-[#A5AEC0] hover:text-[#F1F2F8]">
                    <span>👤</span>
                    <span>My Profile</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/connections" className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#222A3B] text-[#A5AEC0] hover:text-[#F1F2F8]">
                    <span>🤝</span>
                    <span>Connections</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/requests" className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#222A3B] text-[#A5AEC0] hover:text-[#F1F2F8]">
                    <span>📬</span>
                    <span>Connection Requests</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/message-requests" className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#222A3B] text-[#A5AEC0] hover:text-[#F1F2F8]">
                    <span>✉️</span>
                    <span>Message Requests</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/chat" className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-[#222A3B] text-[#A5AEC0] hover:text-[#F1F2F8]">
                    <span>💬</span>
                    <span>Chat</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/premium"
                    className={`flex items-center gap-2.5 py-2 px-3 rounded-lg transition ${
                      isPremium
                        ? "hover:bg-[#D9B875]/10 text-[#D9B875] hover:text-[#F1F2F8]"
                        : "hover:bg-[#222A3B] text-[#55B8E8] hover:text-[#F1F2F8]"
                    }`}
                  >
                    <span>{isPremium ? "👑" : "⭐"}</span>
                    <span>{isPremium ? "Premium Active" : "Get Premium"}</span>
                  </NavLink>
                </li>

                <li className="pt-2 border-t border-[#2B3449] mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-[#A5AEC0] hover:text-[#F1F2F8] hover:bg-[#222A3B]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[#2B3449] space-y-1 animate-in slide-in-from-top-2 duration-150">
            <NavLink
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F1F2F8] hover:bg-[#222A3B]"
            >
              <span>🚀 Feed</span>
            </NavLink>
            <NavLink
              to="/feed?mode=discover"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F1F2F8] hover:bg-[#222A3B]"
            >
              <span>🔍 Discover Developers</span>
            </NavLink>
            <NavLink
              to="/connections"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F1F2F8] hover:bg-[#222A3B]"
            >
              <span>🤝 Connections</span>
            </NavLink>
            <NavLink
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F1F2F8] hover:bg-[#222A3B]"
            >
              <span>💬 Chat</span>
            </NavLink>
            <NavLink
              to="/requests"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F1F2F8] hover:bg-[#222A3B]"
            >
              <span>📬 Connection Requests</span>
            </NavLink>
            <NavLink
              to="/message-requests"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#F1F2F8] hover:bg-[#222A3B]"
            >
              <span>✉️ Message Requests</span>
            </NavLink>
            <NavLink
              to="/premium"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-[#222A3B] ${
                isPremium ? "text-[#D9B875] font-semibold" : "text-[#55B8E8]"
              }`}
            >
              <span>{isPremium ? "👑 Premium Active" : "⭐ Get Premium"}</span>
            </NavLink>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar - Instagram & Social App Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1B2130]/95 backdrop-blur-lg border-t border-[#2B3449] px-2 py-1.5 flex items-center justify-around">
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isActive && !location.search.includes("mode=discover")
                ? "text-[#8B83F7]"
                : "text-[#A5AEC0] hover:text-[#F1F2F8]"
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-medium">Feed</span>
        </NavLink>

        <NavLink
          to="/feed?mode=discover"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            isDiscoverActive
              ? "text-[#55B8E8]"
              : "text-[#A5AEC0] hover:text-[#F1F2F8]"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-medium">Discover</span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isActive ? "text-[#55B8E8]" : "text-[#A5AEC0] hover:text-[#F1F2F8]"
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-medium">Chat</span>
        </NavLink>

        <NavLink
          to="/connections"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isActive ? "text-[#8B83F7]" : "text-[#A5AEC0] hover:text-[#F1F2F8]"
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-[10px] font-medium">Network</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              isActive ? "text-[#8B83F7]" : "text-[#A5AEC0] hover:text-[#F1F2F8]"
            }`
          }
        >
          <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-[#8B83F7]/50">
            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </nav>
    </>
  );
}

export default Navbar;
