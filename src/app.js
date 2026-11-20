
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

const {
  addUser,
  removeUser
} = require("./sockets/onlineUsers");

const app = express();
const server = http.createServer(app);

// Socket.IO initialization
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
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

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
 const messageRequestRouter = require("./routes/messageRequest");
const chatHandler = require("./sockets/chat");
 const conversationRouter = require("./routes/conversation");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", messageRequestRouter);
app.use("/", conversationRouter);

// Connect database and start server
connectDB()
  .then(() => {
    console.log("Connection established successfully");

    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database can't be connected:", err.message);
  });
