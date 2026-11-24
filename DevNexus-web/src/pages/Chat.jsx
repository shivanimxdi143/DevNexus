import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

const API = BASE_URL;

const Chat = () => {
  const user = useSelector((store) => store.user);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedConversationIdRef = useRef(null);

  // Synchronize active conversation ID ref safely outside render
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?._id || null;
  }, [selectedConversation]);

  const currentUserId = user?._id || user?.id;

  // Fetch all user conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API}/conversations`, {
          withCredentials: true,
        });

        const data = res.data.data || [];
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load conversations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [selectedConversation]);

  // Connect Socket.IO
  useEffect(() => {
    const socket = io(API, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      setError("Chat connection failed. Please check network.");
    });

    socket.on("newMessage", (incomingMessage) => {
      const conversationId =
        incomingMessage.conversationId?._id ||
        incomingMessage.conversationId?.toString();

      // Update active messages if message belongs to current conversation
      if (selectedConversationIdRef.current === conversationId) {
        setMessages((prev) =>
          prev.some((item) => item._id === incomingMessage._id)
            ? prev
            : [...prev, incomingMessage]
        );
      }

      // Update latest message preview in conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage: incomingMessage }
            : conv
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (!selectedConversation?._id) return;

    let cancelled = false;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessages([]);
      setError("");

      try {
        const res = await axios.get(
          `${API}/conversations/${selectedConversation._id}/messages`,
          { withCredentials: true }
        );

        if (!cancelled) {
          setMessages(res.data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load messages."
          );
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversation]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Extract recipient user
  const getOtherUser = (conversation) => {
    return conversation.participants?.find((participant) => {
      const participantId = participant?._id || participant;
      return participantId?.toString() !== currentUserId?.toString();
    });
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    const text = newMessage.trim();

    if (!text || !selectedConversation || sending) return;

    if (!socketRef.current?.connected) {
      setError("Chat connection is unavailable. Reconnecting...");
      return;
    }

    const conversationId = selectedConversation._id;

    setSending(true);
    setError("");

    socketRef.current.emit(
      "sendMessage",
      {
        conversationId,
        text,
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          setError(response?.message || "Failed to send message.");
          return;
        }

        const sentMessage = response.data;

        if (selectedConversationIdRef.current === conversationId) {
          setMessages((prev) =>
            prev.some((item) => item._id === sentMessage._id)
              ? prev
              : [...prev, sentMessage]
          );
          setNewMessage("");
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId
              ? { ...conv, lastMessage: sentMessage }
              : conv
          )
        );
      }
    );
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherUser(conv);
    if (!other) return false;
    const name = `${other.firstName || ""} ${other.lastName || ""}`.toLowerCase();
    return name.includes(searchFilter.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#8B83F7] mb-2"></span>
        <p className="text-sm text-[#A5AEC0]">Opening chat workspace...</p>
      </div>
    );
  }

  const activeOtherUser = selectedConversation
    ? getOtherUser(selectedConversation)
    : null;

  return (
    <div className="h-[calc(100vh-4.25rem)] bg-[#151923] text-[#F1F2F8] flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col rounded-3xl glass-card border border-[#2B3449] shadow-2xl overflow-hidden">
        
        {/* Error notification */}
        {error && (
          <div className="px-4 py-2.5 bg-rose-950/80 border-b border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:opacity-75">✕</button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-[#2B3449] flex flex-col bg-[#1B2130] ${
              selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Conversations Header & Search */}
            <div className="p-4 border-b border-[#2B3449] space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-[#F1F2F8] tracking-tight flex items-center gap-2">
                  <span>Messages</span>
                  {conversations.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B83F7]/15 text-[#8B83F7] font-semibold">
                      {conversations.length}
                    </span>
                  )}
                </h1>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-[#151923] border border-[#2B3449] text-xs text-[#F1F2F8] placeholder-[#A5AEC0]/50 focus:outline-none focus:border-[#8B83F7] transition"
                />
                <svg className="w-4 h-4 text-[#A5AEC0] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#2B3449]/40">
              {conversations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#151923] border border-[#2B3449] flex items-center justify-center text-2xl mx-auto mb-3">
                    💬
                  </div>
                  <p className="text-sm font-semibold text-[#F1F2F8]">No conversations yet</p>
                  <p className="text-xs text-[#A5AEC0] mt-1">Connect with developers to start chatting</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <p className="p-4 text-xs text-[#A5AEC0] text-center">No chats match "{searchFilter}"</p>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherUser(conv);
                  if (!other) return null;

                  const isSelected = selectedConversation?._id === conv._id;
                  const otherAvatar = getDeveloperAvatar(other);
                  const isOtherPremium = Boolean(other.isPremium || other.premium?.isActive);

                  return (
                    <button
                      key={conv._id}
                      onClick={() => {
                        setError("");
                        setSelectedConversation(conv);
                      }}
                      className={`w-full flex items-center gap-3.5 p-4 text-left transition-all ${
                        isSelected
                          ? "bg-[#222A3B] border-l-4 border-[#8B83F7]"
                          : "hover:bg-[#222A3B]/40"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-[#2B3449] bg-[#151923]">
                          <img
                            src={otherAvatar}
                            alt={other.firstName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#55B8E8] ring-2 ring-[#1B2130]"></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isSelected ? "text-[#F1F2F8]" : "text-[#F1F2F8]/85"}`}>
                              {other.firstName} {other.lastName}
                            </p>
                            {isOtherPremium && (
                              <span className="text-[#D9B875] text-xs shrink-0" title="Premium Member">
                                👑
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#A5AEC0] truncate">
                          {conv.lastMessage?.text || "Started conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Active Chat Stream */}
          <div
            className={`flex-1 flex flex-col bg-[#151923] min-w-0 ${
              !selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-3xl bg-[#1B2130] border border-[#2B3449] flex items-center justify-center text-4xl mb-4 shadow-xl">
                  💬
                </div>
                <h2 className="text-xl font-bold text-[#F1F2F8]">Your Messages</h2>
                <p className="text-xs text-[#A5AEC0] mt-1 max-w-xs">
                  Select a developer conversation from the sidebar to collaborate in real-time.
                </p>
              </div>
            ) : (
              <>
                {/* Active Conversation Header */}
                <div className="px-5 py-3.5 border-b border-[#2B3449] bg-[#1B2130] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      className="md:hidden p-1.5 rounded-lg text-[#A5AEC0] hover:text-[#F1F2F8] hover:bg-[#222A3B] mr-1"
                      onClick={() => setSelectedConversation(null)}
                      title="Back to conversations"
                    >
                      ←
                    </button>

                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-[#8B83F7]/30 bg-[#151923]">
                        <img
                          src={getDeveloperAvatar(activeOtherUser)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#55B8E8] ring-2 ring-[#1B2130]"></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-bold text-[#F1F2F8] leading-tight">
                          {activeOtherUser?.firstName} {activeOtherUser?.lastName}
                        </h2>
                        {(activeOtherUser?.isPremium || activeOtherUser?.premium?.isActive) && (
                          <span className="text-[#D9B875] text-xs shrink-0" title="Premium Member">
                            👑
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#55B8E8] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#55B8E8] inline-block animate-pulse"></span>
                        Active Connection
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-[#151923]">
                  {messagesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <span className="loading loading-spinner loading-md text-[#8B83F7] mb-2"></span>
                      <p className="text-xs text-[#A5AEC0]">Loading conversation history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-[#A5AEC0] text-xs">
                      No messages yet. Send a greeting to start your conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const senderId = msg.senderId?._id || msg.senderId;
                      const isMine =
                        senderId?.toString() === currentUserId?.toString();

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] sm:max-w-md px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                              isMine
                                ? "gradient-primary text-white rounded-2xl rounded-br-xs shadow-[#8B83F7]/25"
                                : "bg-[#222A3B] text-[#F1F2F8] border border-[#2B3449] rounded-2xl rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-[#2B3449] bg-[#1B2130] flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength={5000}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/50 text-sm focus:outline-none focus:border-[#8B83F7] transition"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-semibold shadow-md shadow-[#8B83F7]/25 hover:opacity-95 transition disabled:opacity-50 shrink-0"
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Chat;
