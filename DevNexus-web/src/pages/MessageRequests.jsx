
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

const MessageRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const fetchRequests = async () => {
        try {
            const res = await axios.get(
                `${API}/message/requests/received`,
                { withCredentials: true }
            );

            setRequests(res.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load message requests."
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
            const res = await axios.patch(
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
                err.response?.data?.message ||
                `Failed to ${action} request.`
            );
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-20">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Message Requests
                </h1>

                {error && (
                    <p className="text-error text-center mb-4">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="text-success text-center mb-4">
                        {success}
                    </p>
                )}

                {requests.length === 0 ? (
                    <div className="text-center mt-16">
                        <div className="text-5xl mb-4">📩</div>
                        <h2 className="text-xl font-semibold">
                            No pending message requests
                        </h2>
                        <p className="text-base-content/60 mt-2">
                            New requests from developers will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const sender = request.fromUser;

                            return (
                                <div
                                    key={request._id}
                                    className="card bg-base-100 shadow-md"
                                >
                                    <div className="card-body">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="avatar">
                                                <div className="w-16 h-16 rounded-full">
                                                    <img
                                                        src={
                                                            sender?.photoUrl ||
                                                            `https://api.dicebear.com/9.x/initials/svg?seed=${sender?.firstName || "Developer"}`
                                                        }
                                                        alt="Developer"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h2 className="card-title">
                                                    {sender?.firstName}{" "}
                                                    {sender?.lastName}
                                                </h2>

                                                <p className="text-sm text-base-content/60">
                                                    Wants to connect with you
                                                </p>

                                                <div className="bg-base-200 rounded-lg p-4 mt-3">
                                                    <p className="text-sm font-semibold mb-1">
                                                        Introductory message
                                                    </p>
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {request.message}
                                                    </p>
                                                </div>

                                                {sender?.skills?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {sender.skills.map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="badge badge-primary badge-outline"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        disabled={processingId === request._id}
                                                        onClick={() =>
                                                            handleAction(request._id, "accept")
                                                        }
                                                    >
                                                        {processingId === request._id
                                                            ? "Processing..."
                                                            : "Accept"}
                                                    </button>

                                                    <button
                                                        className="btn btn-error btn-outline btn-sm"
                                                        disabled={processingId === request._id}
                                                        onClick={() =>
                                                            handleAction(request._id, "reject")
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
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
