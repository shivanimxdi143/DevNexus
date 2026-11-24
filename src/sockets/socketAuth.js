const jwt = require("jsonwebtoken");
const User = require("../models/user");
const cookieParser = require("cookie-parser");

const parseCookies = cookieParser();

const socketAuth = async (socket, next) => {
  try {
    // Parse cookies from the Socket.IO handshake request
    parseCookies(socket.request, {}, async (err) => {
      try {
        if (err) {
          return next(new Error("Cookie parsing failed"));
        }

        // Extract JWT from cookies
        const token = socket.request.cookies?.token;

        if (!token) {
          return next(new Error("Authentication required"));
        }

        // Verify JWT using environment variable
        const decodedData = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        const { _id } = decodedData;

        // Find authenticated user
        const user = await User.findById(_id);

        if (!user) {
          return next(new Error("User not found"));
        }

        // Attach authenticated user's ID to socket
        socket.userId = user._id.toString();

        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });
  } catch (error) {
    next(new Error("Authentication failed"));
  }
};

module.exports = socketAuth;
