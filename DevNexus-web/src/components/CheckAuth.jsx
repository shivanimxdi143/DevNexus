
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser, removeUser } from "../redux/userSlice";

function CheckAuth({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/profile/view",
          {
            withCredentials: true,
          }
        );

        dispatch(addUser(res.data));
      } catch (err) {
        dispatch(removeUser());
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [dispatch]);

  if (loading) {
    return <h2>Checking authentication...</h2>;
  }

  return children;
}

export default CheckAuth;
