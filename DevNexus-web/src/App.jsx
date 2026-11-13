
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Body from "./components/Body";
import Navbar from "./components/Navbar";
import CheckAuth from "./components/CheckAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import HomeRedirect from "./components/HomeRedirect";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <CheckAuth>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Body />
        </div>
      </CheckAuth>
    ),
    children: [
      {
        path: "/",
        element: <HomeRedirect />,
      },
      {
        path: "/feed",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <GuestRoute>
            <Signup />
          </GuestRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;
