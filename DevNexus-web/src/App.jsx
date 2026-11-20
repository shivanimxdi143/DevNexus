
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
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Connections from "./pages/Connections";
import Premium from "./pages/Premium.jsx";
import Chat from "./pages/Chat";
import MessageRequests from "./pages/MessageRequests";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <CheckAuth>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 w-full min-w-0 flex flex-col">
            <Body />
          </main>
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
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/requests",
        element: (
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        ),
      },
      {
        path: "/connections",
        element: (
          <ProtectedRoute>
            <Connections />
          </ProtectedRoute>
        ),
      },
      {
  path: "/premium",
  element: (
    <ProtectedRoute>
      <Premium />
    </ProtectedRoute>
  ),
},
{
  path: "/chat",
  element: (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  ),
},
{
    path: "/message-requests",
    element: (
        <ProtectedRoute>
            <MessageRequests />
        </ProtectedRoute>
    ),
},
    ],
  },
]);

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;
