
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";

const API = "http://localhost:3000";

const Chat = () => {
    const user = useSelector((store) => store.user);

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const currentUserId = user?._id || user?.id;

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await axios.get(`${API}/conversations`, {
                    withCredentials: true,
                });

                setConversations(res.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load conversations."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // Connect Socket.IO
    useEffect(() => {
        const socket = io(API, {
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect_error", (err) => {
            console.error("Socket connection failed:", err.message);
        });

        socket.on("newMessage", (message) => {
            const conversationId =
                message.conversationId?._id ||
                message.conversationId?.toString();

            setMessages((prev) => {
                if (
                    selectedConversation?._id !== conversationId ||
                    prev.some((item) => item._id === message._id)
                ) {
                    return prev;
                }

                return [...prev, message];
            });

            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation._id === conversationId
                        ? { ...conversation, lastMessage: message }
                        : conversation
                )
            );
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [selectedConversation?._id]);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            setMessagesLoading(true);
            setMessages([]);

            try {
                const res = await axios.get(
                    `${API}/conversations/${selectedConversation._id}/messages`,
                    { withCredentials: true }
                );

                setMessages(res.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load messages."
                );
            } finally {
                setMessagesLoading(false);
            }
        };

        fetchMessages();
    }, [selectedConversation]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    // Find the other participant
    const getOtherUser = (conversation) => {
        return conversation.participants?.find(
            (participant) => {
                const participantId =
                    participant?._id || participant;

                return participantId?.toString() !==
                    currentUserId?.toString();
            }
        );
    };

    // Send message
    const handleSendMessage = (e) => {
        e.preventDefault();

        const text = newMessage.trim();

        if (!text || !selectedConversation || sending) return;

        if (!socketRef.current?.connected) {
            setError("Chat connection is unavailable. Please try again.");
            return;
        }

        setSending(true);
        setError("");

        socketRef.current.emit(
            "sendMessage",
            {
                conversationId: selectedConversation._id,
                text,
            },
            (response) => {
                setSending(false);

                if (!response?.success) {
                    setError(response?.message || "Failed to send message.");
                    return;
                }

                const sentMessage = response.data;

                setMessages((prev) =>
                    prev.some((item) => item._id === sentMessage._id)
                        ? prev
                        : [...prev, sentMessage]
                );

                setConversations((prev) =>
                    prev.map((conversation) =>
                        conversation._id === selectedConversation._id
                            ? {
                                ...conversation,
                                lastMessage: sentMessage,
                            }
                            : conversation
                    )
                );

                setNewMessage("");
            }
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-20">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    Messages
                </h1>

                {error && (
                    <p className="text-error text-center mb-3">
                        {error}
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 bg-base-100 rounded-2xl shadow-xl overflow-hidden min-h-[650px]">

                    {/* Conversation List */}
                    <div className="border-r border-base-300">
                        <div className="p-5 border-b border-base-300">
                            <h2 className="text-xl font-semibold">
                                Conversations
                            </h2>
                        </div>

                        {conversations.length === 0 ? (
                            <p className="p-5 text-base-content/60">
                                No conversations yet.
                            </p>
                        ) : (
                            <div>
                                {conversations.map((conversation) => {
                                    const otherUser =
                                        getOtherUser(conversation);

                                    if (!otherUser) return null;

                                    return (
                                        <button
                                            key={conversation._id}
                                            onClick={() => {
                                                setError("");
                                                setSelectedConversation(conversation);
                                            }}
                                            className={`w-full flex items-center gap-3 p-4 text-left hover:bg-base-200 transition ${
                                                selectedConversation?._id === conversation._id
                                                    ? "bg-base-200"
                                                    : ""
                                            }`}
                                        >
                                            <div className="avatar">
                                                <div className="w-12 rounded-full">
                                                    <img
                                                        src={
                                                            otherUser.photoUrl ||
                                                            `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser.firstName}`
                                                        }
                                                        alt={otherUser.firstName}
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold">
                                                    {otherUser.firstName}{" "}
                                                    {otherUser.lastName}
                                                </p>

                                                <p className="text-sm text-base-content/60 truncate">
                                                    {conversation.lastMessage?.text ||
                                                        "Start a conversation"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Chat Window */}
                    <div className="md:col-span-2 flex flex-col min-w-0">

                        {!selectedConversation ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-base-content/50">
                                <div className="text-5xl mb-4">💬</div>
                                <h2 className="text-xl font-semibold">
                                    Your Messages
                                </h2>
                                <p className="mt-2">
                                    Select a conversation to start chatting.
                                </p>
                            </div>
                        ) : (
                            <>
                                {(() => {
                                    const otherUser =
                                        getOtherUser(selectedConversation);

                                    return (
                                        <div className="p-4 border-b border-base-300 flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="w-11 rounded-full">
                                                    <img
                                                        src={
                                                            otherUser?.photoUrl ||
                                                            `https://api.dicebear.com/9.x/initials/svg?seed=${otherUser?.firstName || "User"}`
                                                        }
                                                        alt="Profile"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <h2 className="font-semibold">
                                                    {otherUser?.firstName}{" "}
                                                    {otherUser?.lastName}
                                                </h2>
                                                <p className="text-xs text-success">
                                                    Conversation
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Messages */}
                                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px]">
                                    {messagesLoading ? (
                                        <div className="flex justify-center mt-10">
                                            <span className="loading loading-spinner loading-md" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <p className="text-center text-base-content/50 mt-10">
                                            No messages yet. Say hello!
                                        </p>
                                    ) : (
                                        messages.map((message) => {
                                            const senderId =
                                                message.senderId?._id ||
                                                message.senderId;

                                            const isMine =
                                                senderId?.toString() ===
                                                currentUserId?.toString();

                                            return (
                                                <div
                                                    key={message._id}
                                                    className={`chat ${
                                                        isMine
                                                            ? "chat-end"
                                                            : "chat-start"
                                                    }`}
                                                >
                                                    <div className="chat-bubble">
                                                        {message.text}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="p-4 border-t border-base-300 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        placeholder="Type a message..."
                                        maxLength={5000}
                                        className="input input-bordered flex-1"
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
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
