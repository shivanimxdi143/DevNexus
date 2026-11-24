import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

function Home() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [introMessage, setIntroMessage] = useState("");
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);

  // View mode: "match" (card deck) or "discover" (social grid)
  const [viewMode, setViewMode] = useState("match");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("All");

  const actionLock = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with URL query (?mode=discover)
  useEffect(() => {
    if (location.search.includes("mode=discover")) {
      setViewMode("discover");
    } else {
      setViewMode("match");
    }
  }, [location.search]);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get(
        `${BASE_URL}/feed?page=1&limit=50`,
        { withCredentials: true }
      );
      setUsers(res.data || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setMessage("Failed to load feed.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleAction = useCallback(async (status, targetUser = null) => {
    const userToActOn = targetUser || users[currentIndex];

    if (!userToActOn || actionLock.current) return;

    actionLock.current = true;
    setActionLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userToActOn._id}`,
        {},
        { withCredentials: true }
      );

      // If acting from the main card deck, advance index
      if (!targetUser || targetUser._id === users[currentIndex]?._id) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // If acting from discover grid, remove from local list
        setUsers((prev) => prev.filter((u) => u._id !== userToActOn._id));
      }
    } catch (err) {
      console.error("Request failed:", err);

      setMessageType("error");
      setMessage(
        err.response?.data?.message ||
          err.response?.data ||
          "Something went wrong."
      );
    } finally {
      actionLock.current = false;
      setActionLoading(false);
    }
  }, [users, currentIndex]);

  // Keyboard shortcut listener (Left Arrow: Ignore, Right Arrow: Interested)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showMessageModal || actionLoading || viewMode !== "match") return;
      if (e.key === "ArrowLeft") {
        handleAction("ignored");
      } else if (e.key === "ArrowRight") {
        handleAction("interested");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, showMessageModal, actionLoading, viewMode]);

  const openMessageModalForUser = (user) => {
    setSelectedTargetUser(user);
    setMessage("");
    setIntroMessage("");
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    const target = selectedTargetUser || users[currentIndex];

    if (!target || !introMessage.trim()) {
      setMessage("Please enter a message.");
      setMessageType("error");
      return;
    }

    if (!target._id) {
      setMessage("Unable to identify the recipient.");
      setMessageType("error");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${BASE_URL}/message/request/${target._id}`,
        { message: introMessage.trim() },
        { withCredentials: true }
      );

      setShowMessageModal(false);
      setIntroMessage("");
      setSelectedTargetUser(null);

      if (res.data.conversation) {
        navigate("/chat");
        return;
      }

      setMessageType("success");
      setMessage(
        res.data.message || "Message request sent successfully!"
      );
    } catch (err) {
      console.error("Message request failed:", err);

      setMessageType("error");
      setMessage(
        err.response?.data?.message ||
          "Could not send message request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Collect all unique skills for quick filtering
  const allSkills = [
    "All",
    ...new Set(
      users.flatMap((u) => u.skills || []).filter(Boolean)
    ),
  ].slice(0, 10);

  // Filtered users for Discover mode
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q);
    const skillSearch = u.skills?.some((s) => s.toLowerCase().includes(q));
    const passesSearch = !searchQuery || nameMatch || skillSearch;
    const passesSkillFilter =
      selectedSkillFilter === "All" ||
      u.skills?.some((s) => s.toLowerCase() === selectedSkillFilter.toLowerCase());
    return passesSearch && passesSkillFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B83F7] via-[#55B8E8] to-[#E69AB5] animate-pulse flex items-center justify-center shadow-lg shadow-[#8B83F7]/30 mb-4">
          <span className="text-2xl font-bold text-[#151923]">DN</span>
        </div>
        <span className="loading loading-spinner loading-md text-[#8B83F7] mb-2"></span>
        <p className="text-sm text-[#A5AEC0]">Loading developer feed...</p>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-6 px-4 sm:px-6">
      
      {/* View Mode Toggle & Search Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2B3449]">
        {/* Mode switcher tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-[#1B2130] border border-[#2B3449]">
          <button
            onClick={() => setViewMode("match")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === "match"
                ? "gradient-primary text-white shadow-md shadow-[#8B83F7]/20"
                : "text-[#A5AEC0] hover:text-[#F1F2F8]"
            }`}
          >
            <span>✨ Match Deck</span>
          </button>
          <button
            onClick={() => setViewMode("discover")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              viewMode === "discover"
                ? "bg-[#2B3449] text-[#55B8E8] border border-[#55B8E8]/30 shadow-md shadow-[#55B8E8]/10"
                : "text-[#A5AEC0] hover:text-[#F1F2F8]"
            }`}
          >
            <span>🔍 Discover Grid</span>
          </button>
        </div>

        {/* Search bar (active in both or discover) */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search by name or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-1.5 pl-9 rounded-xl bg-[#1B2130] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/50 text-xs focus:outline-none focus:border-[#8B83F7] transition"
          />
          <svg className="w-4 h-4 text-[#A5AEC0] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Top Banner Alert Message */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-2xl max-w-md w-full text-xs font-medium flex items-center justify-between border ${
            messageType === "success"
              ? "bg-[#222A3B] border-[#55B8E8]/40 text-[#55B8E8]"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{message}</span>
          <button onClick={() => setMessage("")} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* 3. VIEW MODE A: FEATURED MATCH CARD DECK */}
      {viewMode === "match" ? (
        !currentUser ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-[#1B2130] border border-[#2B3449] flex items-center justify-center text-4xl mb-6 shadow-xl">
              ✨
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F2F8]">
              No more users!
            </h2>
            <p className="mt-2 text-[#A5AEC0] text-sm max-w-sm">
              You've viewed everyone in your feed. Check back later for newly joined developers or explore your connections.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={fetchFeed}
                className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-[#8B83F7]/25 hover:opacity-90 transition"
              >
                Refresh Feed
              </button>
              <button
                onClick={() => navigate("/connections")}
                className="px-5 py-2.5 rounded-xl bg-[#222A3B] border border-[#2B3449] text-[#F1F2F8] text-sm font-semibold hover:bg-[#2B3449] transition"
              >
                My Connections
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden glass-card border border-[#2B3449] shadow-2xl transition-all duration-300 hover:border-[#8B83F7]/40">
            
            {/* Photo Container */}
            <div className="relative h-80 sm:h-96 w-full bg-gradient-to-b from-[#1B2130] via-[#222A3B] to-[#151923] overflow-hidden flex items-center justify-center">
              <img
                src={getDeveloperAvatar(currentUser)}
                alt={`${currentUser.firstName}'s avatar`}
                className="w-full h-full object-cover object-top"
              />
              
              {/* Subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B2130] via-transparent to-black/30 pointer-events-none"></div>

              {/* Premium VIP Badge Overlay */}
              {(currentUser.isPremium || currentUser.premium?.isActive) && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9B875]/20 backdrop-blur-md border border-[#D9B875]/50 text-[#D9B875] text-xs font-bold shadow-lg shadow-[#D9B875]/20">
                  <span>👑</span>
                  <span>VIP Member</span>
                </div>
              )}

              {/* Card Counter Pill */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#151923]/75 backdrop-blur-md border border-[#2B3449] text-[11px] font-medium text-[#A5AEC0]">
                {currentIndex + 1} / {users.length}
              </div>
            </div>

            {/* Card Body & Details */}
            <div className="p-6 sm:p-7 bg-[#1B2130] border-t border-[#2B3449]/70 space-y-4">
              
              {/* Name & Basic Info */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-extrabold text-[#F1F2F8] tracking-tight truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </h2>
                  {currentUser.age && (
                    <span className="text-lg font-bold text-[#A5AEC0]">
                      {currentUser.age}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#A5AEC0] mt-1">
                  {currentUser.gender && (
                    <span className="capitalize px-2 py-0.5 rounded-md bg-[#222A3B] border border-[#2B3449]">
                      {currentUser.gender}
                    </span>
                  )}
                  {currentUser.age && (
                    <span>• {currentUser.age} years old</span>
                  )}
                </div>
              </div>

              {/* About / Bio */}
              <div className="text-sm text-[#F1F2F8]/90 leading-relaxed line-clamp-3">
                {currentUser.about || "Passionate software engineer building modern applications and seeking creative collaboration."}
              </div>

              {/* Tech Stack / Skills */}
              {currentUser.skills && currentUser.skills.length > 0 && (
                <div className="pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5AEC0] mb-2">
                    Core Technologies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8B83F7]/12 text-[#8B83F7] border border-[#8B83F7]/25"
                      >
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Dock */}
              <div className="pt-4 flex items-center justify-center gap-3 sm:gap-4">
                
                {/* Ignore Button */}
                <button
                  type="button"
                  className="btn btn-circle sm:btn-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition shadow-lg shadow-rose-500/10 px-4 sm:px-6 w-auto flex-1 font-semibold text-sm"
                  onClick={() => handleAction("ignored")}
                  disabled={actionLoading}
                  title="Ignore Profile (Left Arrow)"
                >
                  <span className="mr-1">✕</span>
                  <span>Ignore</span>
                </button>

                {/* Direct Message Button */}
                <button
                  type="button"
                  className="btn btn-circle sm:btn-md bg-[#222A3B] hover:bg-[#2B3449] text-[#55B8E8] border border-[#55B8E8]/35 hover:border-[#55B8E8]/60 transition shadow-lg shadow-[#151923]/40 px-3 sm:px-4 w-auto font-semibold text-sm"
                  onClick={() => openMessageModalForUser(currentUser)}
                  disabled={actionLoading}
                  title="Send Message Request"
                >
                  <span>💬 Message</span>
                </button>

                {/* Interested Button */}
                <button
                  type="button"
                  className="btn btn-circle sm:btn-md gradient-primary text-white border-none transition shadow-lg shadow-[#8B83F7]/30 px-4 sm:px-6 w-auto flex-1 font-semibold text-sm hover:opacity-95"
                  onClick={() => handleAction("interested")}
                  disabled={actionLoading}
                  title="Connect / Interested (Right Arrow)"
                >
                  <span className="mr-1">💖</span>
                  <span>Interested</span>
                </button>

              </div>

              {/* Keyboard hint */}
              <p className="text-center text-[11px] text-[#A5AEC0]/70 pt-1">
                Tip: Press <kbd className="kbd kbd-xs bg-[#222A3B] border-[#2B3449] text-[#F1F2F8]">←</kbd> to Ignore and <kbd className="kbd kbd-xs bg-[#222A3B] border-[#2B3449] text-[#F1F2F8]">→</kbd> for Interested
              </p>

            </div>
          </div>
        )
      ) : (
        /* 4. VIEW MODE B: DISCOVER DEVELOPERS SOCIAL GRID */
        <div className="w-full space-y-6">
          
          {/* Skill Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedSkillFilter === skill
                    ? "gradient-primary text-white shadow-sm shadow-[#8B83F7]/25"
                    : "bg-[#1B2130] text-[#A5AEC0] border border-[#2B3449] hover:bg-[#222A3B] hover:text-[#F1F2F8]"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Developers Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-[#A5AEC0]">
              No developers found matching "{searchQuery || selectedSkillFilter}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((dev) => {
                const avatar = getDeveloperAvatar(dev);
                const isDevPremium = Boolean(dev.isPremium || dev.premium?.isActive);

                return (
                  <div
                    key={dev._id}
                    className="rounded-3xl glass-card border border-[#2B3449] overflow-hidden flex flex-col justify-between card-transition group hover:border-[#8B83F7]/40"
                  >
                    <div>
                      {/* Card Header & Avatar */}
                      <div className="relative h-44 bg-gradient-to-b from-[#1B2130] to-[#222A3B] overflow-hidden">
                        <img
                          src={avatar}
                          alt={dev.firstName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#222A3B] via-transparent to-black/20 pointer-events-none"></div>

                        {isDevPremium && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D9B875]/20 backdrop-blur-md border border-[#D9B875]/40 text-[#D9B875] text-[10px] font-bold">
                            <span>👑</span>
                            <span>VIP</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-[#F1F2F8] group-hover:text-[#8B83F7] transition truncate">
                            {dev.firstName} {dev.lastName}
                          </h3>
                          <p className="text-xs text-[#A5AEC0]">
                            {dev.age && `${dev.age} yrs`}
                            {dev.age && dev.gender && " • "}
                            {dev.gender}
                          </p>
                        </div>

                        <p className="text-xs text-[#F1F2F8]/85 line-clamp-2 leading-relaxed">
                          {dev.about || "Active software developer on DevNexus."}
                        </p>

                        {/* Skills */}
                        {dev.skills && dev.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {dev.skills.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#8B83F7]/12 text-[#8B83F7] border border-[#8B83F7]/25"
                              >
                                #{s}
                              </span>
                            ))}
                            {dev.skills.length > 3 && (
                              <span className="text-[10px] text-[#A5AEC0] self-center">
                                +{dev.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-2 border-t border-[#2B3449]/70 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openMessageModalForUser(dev)}
                        className="py-2 px-3 rounded-xl bg-[#1B2130] hover:bg-[#2B3449] border border-[#55B8E8]/30 text-[#55B8E8] text-xs font-semibold transition"
                      >
                        💬 Message
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction("interested", dev)}
                        className="flex-1 py-2 px-3 rounded-xl gradient-primary text-white text-xs font-semibold shadow-sm shadow-[#8B83F7]/20 hover:opacity-95 transition"
                      >
                        💖 Connect
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151923]/80 backdrop-blur-md p-4">
          <div className="bg-[#1B2130] border border-[#2B3449] text-[#F1F2F8] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold tracking-tight">
                Message {(selectedTargetUser || currentUser)?.firstName}
              </h2>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage("");
                  setSelectedTargetUser(null);
                }}
                className="text-[#A5AEC0] hover:text-[#F1F2F8] transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A5AEC0] mb-4">
              Send an introductory collaboration message directly to their inbox.
            </p>

            <textarea
              className="w-full px-4 py-3 rounded-2xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/50 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition resize-none"
              placeholder="Hey! I came across your profile and would love to collaborate on..."
              rows={4}
              maxLength={1000}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs text-[#A5AEC0] mt-2">
              <span>{introMessage.length}/1000 characters</span>
            </div>

            {message && (
              <p className="text-rose-400 text-xs mt-2">
                {message}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-[#A5AEC0] hover:text-[#F1F2F8] hover:bg-[#222A3B] text-sm font-medium transition"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage("");
                  setSelectedTargetUser(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md shadow-[#8B83F7]/30 hover:opacity-90 transition disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={actionLoading || !introMessage.trim()}
              >
                {actionLoading ? "Sending..." : "Send Message"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
