import { Outlet } from "react-router-dom";
import Footer from "./Footer";

function Body() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Body;