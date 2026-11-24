import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "../redux/userSlice";
import { BASE_URL } from "../config/api";

function CheckAuth({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/profile/view`,
          {
            withCredentials: true,
          }
        );

        dispatch(addUser(res.data));
      } catch {
        dispatch(removeUser());
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151923] flex flex-col items-center justify-center text-[#F1F2F8] px-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#8B83F7] via-[#55B8E8] to-[#E69AB5] animate-pulse flex items-center justify-center shadow-lg shadow-[#8B83F7]/25 border border-[rgba(139,131,247,0.3)]">
            <span className="text-3xl font-extrabold tracking-wider text-[#151923]">DN</span>
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#8B83F7] to-[#55B8E8] opacity-25 blur-xl animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="loading loading-spinner loading-sm text-[#8B83F7]"></span>
          <span className="text-sm font-medium tracking-wide text-[#F1F2F8]">
            Checking authentication...
          </span>
        </div>
        <p className="text-xs text-[#A5AEC0]">Connecting to DevNexus network</p>
      </div>
    );
  }

  return children;
}

export default CheckAuth;
