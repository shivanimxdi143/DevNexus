
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function HomeRedirect() {
  const user = useSelector((store) => store.user);

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default HomeRedirect;
