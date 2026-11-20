
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [introMessage, setIntroMessage] = useState("");

  const actionLock = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/feed?page=1&limit=50",
          { withCredentials: true }
        );

        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setMessage("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const handleAction = async (status) => {
    const currentUser = users[currentIndex];

    if (!currentUser || actionLock.current) return;

    actionLock.current = true;
    setActionLoading(true);
    setMessage("");

    try {
      await axios.post(
        `http://localhost:3000/request/send/${status}/${currentUser._id}`,
        {},
        { withCredentials: true }
      );

      setCurrentIndex((prev) => prev + 1);
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
  };

 
const handleSendMessage = async () => {
  const targetUser = users[currentIndex];

  if (!targetUser || !introMessage.trim()) {
    setMessage("Please enter a message.");
    setMessageType("error");
    return;
  }

  // Verify the exact recipient before sending
  console.log("Message recipient:", {
    name: `${targetUser.firstName} ${targetUser.lastName}`,
    email: targetUser.emailId,
    id: targetUser._id
  });

  if (!targetUser._id) {
    setMessage("Unable to identify the recipient.");
    setMessageType("error");
    return;
  }

  setActionLoading(true);
  setMessage("");

  try {
    const res = await axios.post(
      `http://localhost:3000/message/request/${targetUser._id}`,
      { message: introMessage.trim() },
      { withCredentials: true }
    );

    console.log("Message request response:", res.data);

    setShowMessageModal(false);
    setIntroMessage("");

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


  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        Loading feed...
      </div>
    );
  }

  const currentUser = users[currentIndex];

  if (!currentUser) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold">No more users!</h2>
        <p className="mt-2">
          You've viewed everyone in your feed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[75vh] p-5">
      <div className="card bg-[#171b21] text-white w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Profile Image */}
        <figure className="bg-[#252a32] h-72 overflow-hidden">
          <img
            src={
              currentUser.photoUrl ||
              `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(currentUser._id)}`
            }
            alt={`${currentUser.firstName}'s avatar`}
            className="w-full h-full object-contain"
          />
        </figure>

        {/* User Details */}
        <div className="card-body p-6">

          {/* Name and Premium Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="card-title text-xl">
              {currentUser.firstName} {currentUser.lastName}
            </h2>

            {currentUser.isPremium && (
              <span className="badge badge-warning gap-1">
                👑 Premium
              </span>
            )}
          </div>

          <p className="text-gray-400 text-sm">
            {currentUser.about || "No description available"}
          </p>

          <div className="flex gap-4 text-sm text-gray-400 mt-2">
            <span>Age: {currentUser.age ?? "N/A"}</span>
            <span>Gender: {currentUser.gender ?? "N/A"}</span>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`alert mt-3 ${
                messageType === "success"
                  ? "alert-success"
                  : "alert-error"
              }`}
            >
              <span>{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card-actions justify-center mt-5">
            <button
              className="btn btn-primary px-5"
              onClick={() => handleAction("ignored")}
              disabled={actionLoading}
            >
              Ignore
            </button>

            <button
              className="btn bg-pink-500 hover:bg-pink-600 text-white border-none px-5"
              onClick={() => handleAction("interested")}
              disabled={actionLoading}
            >
              Interested
            </button>

            <button
              className="btn btn-outline btn-secondary px-5"
              onClick={() => {
                setMessage("");
                setIntroMessage("");
                setShowMessageModal(true);
              }}
              disabled={actionLoading}
            >
              💬 Message
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-2">
            {currentIndex + 1} of {users.length}
          </p>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#171b21] text-white rounded-xl p-6 w-full max-w-md shadow-2xl">

            <h2 className="text-xl font-bold mb-2">
              Message {currentUser.firstName}
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              Introduce yourself and start a conversation.
            </p>

            <textarea
              className="textarea textarea-bordered w-full bg-[#252a32] text-white"
              placeholder="Hey! I'd like to connect with you..."
              rows={4}
              maxLength={1000}
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
            />

            <p className="text-right text-xs text-gray-400 mt-1">
              {introMessage.length}/1000
            </p>

            {message && (
              <p className="text-error text-sm mt-2">
                {message}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className="btn btn-secondary"
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
