import { Outlet } from "react-router-dom";
import Footer from "./Footer";

function Body() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Body;
