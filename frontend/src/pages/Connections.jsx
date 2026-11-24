import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/user/connections`,
          { withCredentials: true }
        );

        setConnections(res.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch connections"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleRemove = async (connectionId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this connection?"
    );

    if (!confirmRemove) return;

    setRemovingId(connectionId);
    setMessage("");

    try {
      await axios.delete(
        `${BASE_URL}/request/remove/${connectionId}`,
        { withCredentials: true }
      );

      setConnections((prev) =>
        prev.filter((connection) => connection.connectionId !== connectionId)
      );

      setMessage("Connection removed successfully.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to remove connection."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleDirectChat = async (targetUserId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/message/request/${targetUserId}`,
        { message: "Hi! Let's chat." },
        { withCredentials: true }
      );

      if (res.data.conversation) {
        navigate("/chat");
      }
    } catch {
      navigate("/chat");
    }
  };

  const filteredConnections = connections.filter((conn) => {
    const u = conn.user;
    if (!u) return false;
    const query = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const matchSkills = u.skills?.some((s) => s.toLowerCase().includes(query));
    return fullName.includes(query) || matchSkills;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#8B83F7] mb-2"></span>
        <p className="text-sm text-[#A5AEC0]">Loading your network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151923] text-[#F1F2F8] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header & Search */}
        <div className="mb-8 pb-6 border-b border-[#2B3449] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#F1F2F8] tracking-tight">
              My Connections
            </h1>
            <p className="text-sm text-[#A5AEC0] mt-1">
              Your professional developer network and matched peers
            </p>
          </div>

          {/* Search filter */}
          {connections.length > 0 && (
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-9 rounded-xl bg-[#1B2130] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/50 text-sm focus:outline-none focus:border-[#8B83F7] transition"
              />
              <svg className="w-4 h-4 text-[#A5AEC0] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Global Feedback Notifications */}
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-[#222A3B] border border-[#55B8E8]/40 text-[#55B8E8] text-sm flex items-center justify-between shadow-lg">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="hover:opacity-75">✕</button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-sm">
            {error}
          </div>
        )}

        {/* Connections Grid or Empty State */}
        {connections.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-3xl glass-card border border-[#2B3449] shadow-xl max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#1B2130] border border-[#2B3449] flex items-center justify-center text-3xl mx-auto mb-4">
              🤝
            </div>
            <h2 className="text-xl font-bold text-[#F1F2F8]">
              You don't have any connections yet.
            </h2>
            <p className="text-sm text-[#A5AEC0] mt-2 max-w-sm mx-auto">
              Explore your developer feed to discover peers and build your collaborative network.
            </p>
            <button
              onClick={() => navigate("/feed")}
              className="mt-6 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-[#8B83F7]/25 hover:opacity-90 transition"
            >
              Explore Feed
            </button>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-12 text-[#A5AEC0]">
            No connections matched your search "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((connection) => {
              const u = connection.user;
              if (!u) return null;

              const avatarSrc = getDeveloperAvatar(u);
              const isUserPremium = Boolean(u.isPremium || u.premium?.isActive);

              return (
                <div
                  key={connection.connectionId}
                  className="rounded-3xl glass-card border border-[#2B3449] p-6 flex flex-col justify-between card-transition group hover:border-[#8B83F7]/40"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[#8B83F7]/30 bg-[#1B2130] shrink-0">
                        <img
                          src={avatarSrc}
                          alt={u.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-lg font-bold text-[#F1F2F8] truncate group-hover:text-[#8B83F7] transition">
                            {u.firstName} {u.lastName}
                          </h2>
                          {isUserPremium && (
                            <span className="text-[#D9B875] text-xs shrink-0" title="Premium Member">
                              👑
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#A5AEC0]">
                          {u.age && `${u.age} years`}
                          {u.age && u.gender && " • "}
                          {u.gender}
                        </p>
                      </div>
                    </div>

                    {/* Bio Excerpt */}
                    <p className="text-xs text-[#F1F2F8]/85 line-clamp-2 leading-relaxed">
                      {u.about || "Fellow developer on DevNexus."}
                    </p>

                    {/* Skills */}
                    {u.skills && u.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {u.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#8B83F7]/12 text-[#8B83F7] border border-[#8B83F7]/25"
                          >
                            #{skill}
                          </span>
                        ))}
                        {u.skills.length > 4 && (
                          <span className="text-[10px] text-[#A5AEC0] self-center">
                            +{u.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-5 mt-4 border-t border-[#2B3449]/70 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDirectChat(u._id)}
                      className="flex-1 py-2 px-3 rounded-xl gradient-primary text-white text-xs font-semibold shadow-md shadow-[#8B83F7]/25 hover:opacity-95 transition flex items-center justify-center gap-1.5"
                    >
                      <span>💬</span>
                      <span>Chat</span>
                    </button>

                    <button
                      type="button"
                      className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
                      onClick={() => handleRemove(connection.connectionId)}
                      disabled={removingId === connection.connectionId}
                    >
                      {removingId === connection.connectionId
                        ? "Removing..."
                        : "Remove Connection"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Connections;
