import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/requests/received`,
        { withCredentials: true }
      );

      setRequests(res.data.data || []);
    } catch {
      setMessage("Failed to load connection requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async (requestId, status) => {
    setProcessingId(requestId);
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        { withCredentials: true }
      );

      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      setMessage(
        status === "accepted"
          ? "Connection request accepted!"
          : "Connection request rejected!"
      );
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#8B83F7] mb-2"></span>
        <p className="text-sm text-[#A5AEC0]">Loading connection requests...</p>
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
              Connection Requests
            </h1>
            <p className="text-sm text-[#A5AEC0] mt-1">
              Developers interested in connecting and collaborating with you
            </p>
          </div>
          {requests.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-[#8B83F7]/15 border border-[#8B83F7]/30 text-[#8B83F7] text-xs font-semibold">
              {requests.length} pending
            </span>
          )}
        </div>

        {/* Global Feedback Banner */}
        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-[#222A3B] border border-[#55B8E8]/40 text-[#55B8E8] text-sm flex items-center justify-between shadow-lg">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="hover:opacity-75">✕</button>
          </div>
        )}

        {/* Request List or Empty State */}
        {requests.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-3xl glass-card border border-[#2B3449] shadow-xl">
            <div className="w-20 h-20 rounded-full bg-[#1B2130] border border-[#2B3449] flex items-center justify-center text-3xl mx-auto mb-4">
              📬
            </div>
            <h2 className="text-xl font-bold text-[#F1F2F8]">
              No pending requests
            </h2>
            <p className="text-sm text-[#A5AEC0] mt-2 max-w-sm mx-auto">
              When someone sends you a connection request, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const sender = request.fromId_sender;
              if (!sender) return null;

              const avatarSrc = getDeveloperAvatar(sender);
              const isSenderPremium = Boolean(sender.isPremium || sender.premium?.isActive);

              return (
                <div
                  key={request._id}
                  className="rounded-3xl glass-card border border-[#2B3449] p-6 card-transition hover:border-[#8B83F7]/40"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-[#8B83F7]/30 bg-[#1B2130] shadow-md">
                        <img
                          src={avatarSrc}
                          alt={sender.firstName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Sender Details */}
                    <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <h2 className="text-xl font-bold text-[#F1F2F8] truncate">
                            {sender.firstName} {sender.lastName}
                          </h2>
                          {isSenderPremium && (
                            <span className="text-[#D9B875] text-sm" title="Premium Member">
                              👑
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#A5AEC0]">
                          {sender.gender && (
                            <span className="capitalize px-2 py-0.5 rounded bg-[#222A3B] border border-[#2B3449]">
                              {sender.gender}
                            </span>
                          )}
                          {sender.age && <span>Age: {sender.age}</span>}
                        </div>
                      </div>

                      <p className="text-sm text-[#F1F2F8]/85 leading-relaxed line-clamp-2">
                        {sender.about || "Developer seeking connection and collaboration."}
                      </p>

                      {sender.skills && sender.skills.length > 0 && (
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                          {sender.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#8B83F7]/12 text-[#8B83F7] border border-[#8B83F7]/25"
                            >
                              #{skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review Actions */}
                    <div className="flex sm:flex-col gap-2.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        type="button"
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md shadow-[#8B83F7]/25 hover:opacity-95 transition disabled:opacity-50"
                        onClick={() => handleReview(request._id, "accepted")}
                        disabled={processingId === request._id}
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold transition disabled:opacity-50"
                        onClick={() => handleReview(request._id, "rejected")}
                        disabled={processingId === request._id}
                      >
                        Reject
                      </button>
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
}

export default Requests;
