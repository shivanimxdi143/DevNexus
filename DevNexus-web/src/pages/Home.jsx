
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/feed",
          { withCredentials: true }
        );

        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const handleAction = () => {
    setCurrentIndex((prev) => prev + 1);
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
        <p className="mt-2">You've viewed everyone in your feed.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[75vh] p-5">

      <div className="card bg-[#171b21] text-white w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Profile Image */}
        <figure className="bg-[#252a32] h-72 overflow-hidden">
          <img
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(currentUser._id)}`}
            alt={`${currentUser.firstName}'s avatar`}
            className="w-full h-full object-contain"
          />
        </figure>

        {/* User Details */}
        <div className="card-body p-6">

          <h2 className="card-title text-xl">
            {currentUser.firstName} {currentUser.lastName}
          </h2>

          <p className="text-gray-400 text-sm">
            {currentUser.about || "No description available"}
          </p>

          <div className="flex gap-4 text-sm text-gray-400 mt-2">
            <span>Age: {currentUser.age ?? "N/A"}</span>
            <span>Gender: {currentUser.gender ?? "N/A"}</span>
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-center mt-5">

            <button
              className="btn btn-primary px-7"
              onClick={handleAction}
            >
              Ignore
            </button>

            <button
              className="btn bg-pink-500 hover:bg-pink-600 text-white border-none px-7"
              onClick={handleAction}
            >
              Interested
            </button>

          </div>

          <p className="text-center text-xs text-gray-500 mt-2">
            {currentIndex + 1} of {users.length}
          </p>

        </div>
      </div>

    </div>
  );
}

export default Home;
