
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const dispatch = useDispatch();
 const navigate = useNavigate();

async function handleLogin() {
  try {
    // Step 1: Login API
    await axios.post(
      "http://localhost:3000/login",
      {
        emailId: email,
        password: password,
      },
      {
        withCredentials: true,
      }
    );

    // Step 2: Fetch logged-in user's details
    const res = await axios.get(
      "http://localhost:3000/profile/view",
      {
        withCredentials: true,
      }
    );

    // Step 3: Store user details in Redux
    dispatch(addUser(res.data));
    navigate("/feed");

    alert("Login successful!");
  } catch (err) {
    console.log(err);
    alert(err.response?.data || "Something went wrong");
  }
}


  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card bg-base-200 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">
            Login
          </h2>

          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label mt-3">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="card-actions justify-center mt-5">
            <button
              className="btn btn-primary btn-sm w-32"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
