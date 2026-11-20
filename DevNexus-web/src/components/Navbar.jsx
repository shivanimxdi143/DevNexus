
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { removeUser } from "../redux/userSlice";

function Navbar() {
    const user = useSelector((store) => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isPremium, setIsPremium] = useState(false);

    // Fetch Premium membership status
    useEffect(() => {
        if (!user) return;

        const fetchPremiumStatus = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:3000/payment/status",
                    { withCredentials: true }
                );

                setIsPremium(res.data.isActive);
            } catch (err) {
                console.error("Failed to fetch Premium status:", err);
                setIsPremium(false);
            }
        };

        fetchPremiumStatus();
    }, [user]);

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:3000/logout",
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

    return (
        <div className="navbar bg-[#17191f] text-white px-6 shadow-md">

            {/* Logo */}
            <div className="flex-1">
                <NavLink
                    to="/feed"
                    className="text-2xl font-bold flex items-center gap-2"
                >
                    🔒 DevNexus
                </NavLink>
            </div>

            {/* Username and Profile Dropdown */}
            <div className="flex items-center gap-3">

                <span className="text-white font-semibold text-base">
                    {user.firstName} {user.lastName}
                </span>

                <div className="dropdown dropdown-end">

                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle avatar"
                    >
                        <div className="w-10 rounded-full">
                            <img
                                src={
                                    user.photoUrl ||
                                    `https://api.dicebear.com/9.x/initials/svg?seed=${user.firstName}`
                                }
                                alt="Profile"
                            />
                        </div>
                    </div>

                    <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-[#252b34] text-white rounded-box z-50 w-56 p-3 shadow-lg mt-3"
                    >
                        <li>
                            <NavLink to="/feed">Dashboard</NavLink>
                        </li>

                        <li>
                            <NavLink to="/profile">My Profile</NavLink>
                        </li>

                        <li>
                            <NavLink to="/requests">Requests</NavLink>
                        </li>
                        <li>
               <NavLink to="/message-requests">
        Message Requests
            </NavLink>
            </li>

                        <li>
                            <NavLink to="/connections">Connections</NavLink>
                        </li>

                        <li>
                         <NavLink to="/chat">💬 Chat</NavLink>
                        </li>

                        <li>
                            <NavLink to="/premium">
                                {isPremium ? "👑 Premium Active" : "⭐ Get Premium"}
                            </NavLink>
                        </li>

                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-red-400"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>

                </div>
            </div>
        </div>
    );
}

export default Navbar;
