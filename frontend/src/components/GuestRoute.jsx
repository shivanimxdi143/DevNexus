
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function GuestRoute({ children }) {
  const user = useSelector((store) => store.user);

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

export default GuestRoute;
