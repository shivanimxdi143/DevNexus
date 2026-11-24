require("dotenv").config();

const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const connectDB = require("./config/database");
const socketAuth = require("./sockets/socketAuth");
const chatHandler = require("./sockets/chat");

const {
  addUser,
  removeUser
} = require("./sockets/onlineUsers");

const app = express();
const server = http.createServer(app);

// Exact allowed origins for CORS (no wildcards)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes(origin.replace(/\/$/, ""))
    ) {
      return callback(null, origin);
    }
    return callback(new Error("CORS policy: This origin is not allowed"));
  },
  credentials: true,
};

// Socket.IO initialization
const io = new Server(server, {
  cors: corsOptions,
});

// Authenticate every incoming socket connection
io.use(socketAuth);

// Handle authenticated connections
io.on("connection", (socket) => {
  const userId = socket.userId;
 
  // Register this user's socket connection
  addUser(userId, socket.id);
  chatHandler(io, socket);
  console.log("User connected:", socket.id);
  console.log("Authenticated user:", userId);

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove this socket connection
    removeUser(userId, socket.id);
    console.log("User disconnected:", socket.id);
  });
});

// Express middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const messageRequestRouter = require("./routes/messageRequest");
const conversationRouter = require("./routes/conversation");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", messageRequestRouter);
app.use("/", conversationRouter);

// Connect database and start server
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Connection established successfully");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database can't be connected:", err.message);
  });
