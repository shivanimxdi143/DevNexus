import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

const API = BASE_URL;

const MessageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/message/requests/received`, {
        withCredentials: true,
      });

      setRequests(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load message requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    setProcessingId(requestId);
    setError("");
    setSuccess("");

    try {
      await axios.patch(
        `${API}/message/request/${requestId}/${action}`,
        {},
        { withCredentials: true }
      );

      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      if (action === "accept") {
        setSuccess("Message request accepted!");
        navigate("/chat");
      } else {
        setSuccess("Message request rejected.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to ${action} request.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#8B83F7] mb-2"></span>
        <p className="text-sm text-[#A5AEC0]">Loading message requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151923] text-[#F1F2F8] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[#2B3449] flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#F1F2F8] tracking-tight">
              Message Requests
            </h1>
            <p className="text-sm text-[#A5AEC0] mt-1">
              Direct introductory messages from other developers
            </p>
          </div>
          {requests.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-[#E69AB5]/15 border border-[#E69AB5]/30 text-[#E69AB5] text-xs font-semibold">
              {requests.length} incoming
            </span>
          )}
        </div>

        {/* Global Feedback Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:opacity-75">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-[#222A3B] border border-[#55B8E8]/40 text-[#55B8E8] text-sm flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="hover:opacity-75">✕</button>
          </div>
        )}

        {/* Requests List or Empty State */}
        {requests.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-3xl glass-card border border-[#2B3449] shadow-xl">
            <div className="w-20 h-20 rounded-full bg-[#1B2130] border border-[#2B3449] flex items-center justify-center text-3xl mx-auto mb-4">
              📩
            </div>
            <h2 className="text-xl font-bold text-[#F1F2F8]">
              No pending message requests
            </h2>
            <p className="text-sm text-[#A5AEC0] mt-2 max-w-sm mx-auto">
              Direct introduction notes from developers will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const sender = request.fromUser;
              const avatarSrc = getDeveloperAvatar(sender);
              const isSenderPremium = Boolean(sender?.isPremium || sender?.premium?.isActive);

              return (
                <div
                  key={request._id}
                  className="rounded-3xl glass-card border border-[#2B3449] p-6 sm:p-7 card-transition hover:border-[#8B83F7]/40"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[#8B83F7]/30 bg-[#1B2130] shrink-0 shadow-md">
                      <img
                        src={avatarSrc}
                        alt="Developer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-lg font-bold text-[#F1F2F8]">
                            {sender?.firstName} {sender?.lastName}
                          </h2>
                          {isSenderPremium && (
                            <span className="text-[#D9B875] text-xs shrink-0" title="Premium Member">
                              👑
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#A5AEC0]">
                          Sent you an introductory collaboration pitch
                        </p>
                      </div>

                      {/* Introductory Message Card */}
                      <div className="bg-[#1B2130] border border-[#2B3449] rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#55B8E8] mb-1">
                          <span>💬</span>
                          <span>Introductory Note</span>
                        </div>
                        <p className="text-sm text-[#F1F2F8]/90 whitespace-pre-wrap break-words leading-relaxed">
                          {request.message}
                        </p>
                      </div>

                      {/* Skills */}
                      {sender?.skills && sender.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {sender.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#8B83F7]/12 text-[#8B83F7] border border-[#8B83F7]/25"
                            >
                              #{skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-semibold shadow-md shadow-[#8B83F7]/25 hover:opacity-95 transition disabled:opacity-50"
                          disabled={processingId === request._id}
                          onClick={() => handleAction(request._id, "accept")}
                        >
                          {processingId === request._id ? "Processing..." : "Accept"}
                        </button>

                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition disabled:opacity-50"
                          disabled={processingId === request._id}
                          onClick={() => handleAction(request._id, "reject")}
                        >
                          Reject
                        </button>
                      </div>

                    </div>

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

export default MessageRequests;
