const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const { TeacherLogin } = require("./controllers/login");
const {
  createPoll,
  voteOnOption,
  getPolls,
} = require("../src/controllers/poll");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

const port = process.env.PORT || 3001;

const DB = process.env.MONGODB_URL;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.error("Failed to connect to MongoDB:", e);
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let votes = {};
let connectedUsers = {};
let kickedUsers = []; // Array to track kicked usernames

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);
  console.log("👥 Total connected clients:", io.engine.clientsCount);

  socket.on("createPoll", async (pollData) => {
    console.log("📝 RECEIVED createPoll event from:", socket.id);
    console.log("📝 Poll data:", {
      question: pollData.question,
      options: pollData.options?.length || 0,
      timer: pollData.timer,
      teacher: pollData.teacherUsername,
    });

    votes = {};
    const poll = await createPoll(pollData);

    console.log("💾 Poll saved to database with ID:", poll._id);
    console.log("📡 BROADCASTING pollCreated to all connected clients");
    console.log("📡 Number of connected clients:", io.engine.clientsCount);

    io.emit("pollCreated", poll);

    console.log("✅ Poll broadcast completed");
  });

  socket.on("kickOut", (kickData) => {
    // Handle both old and new format
    const userToKick =
      typeof kickData === "string" ? kickData : kickData.username;

    console.log("Attempting to kick out user:", userToKick);
    console.log("Kick data:", kickData);
    console.log("Connected users:", connectedUsers);

    // Find all socket IDs for this username (there could be multiple connections)
    const socketIdsToKick = [];
    for (let id in connectedUsers) {
      if (connectedUsers[id] === userToKick) {
        socketIdsToKick.push(id);
      }
    }

    console.log("Socket IDs to kick:", socketIdsToKick);

    if (socketIdsToKick.length === 0) {
      console.log("No sockets found for user:", userToKick);
      return;
    }

    // Kick out all instances of this user
    socketIdsToKick.forEach((id) => {
      console.log("Emitting kickedOut event to socket ID:", id);

      // Send a broadcast to ALL clients that this user was kicked out
      io.emit("userKicked", {
        username: userToKick,
        timestamp: new Date().toISOString(),
      });

      // Send direct message to the kicked user
      io.to(id).emit("kickedOut", {
        message: "You have been kicked out.",
        forced: true,
      });

      // Get the socket instance
      const userSocket = io.sockets.sockets.get(id);
      if (userSocket) {
        console.log("Disconnecting socket:", id);
        // Force disconnect immediately
        userSocket.disconnect(true);
      } else {
        console.log("Socket not found:", id);
      }

      // Remove from connected users
      delete connectedUsers[id];
    });

    // Add the kicked user to the kickedUsers array if not already there
    if (!kickedUsers.includes(userToKick)) {
      kickedUsers.push(userToKick);
      console.log("Updated kicked users list:", kickedUsers);
    }

    // Update the participants list for everyone
    io.emit("participantsUpdate", Object.values(connectedUsers));
  });

  socket.on("joinChat", ({ username }) => {
    connectedUsers[socket.id] = username;
    io.emit("participantsUpdate", Object.values(connectedUsers));

    socket.on("disconnect", () => {
      delete connectedUsers[socket.id];
      io.emit("participantsUpdate", Object.values(connectedUsers));
    });
  });

  socket.on("studentLogin", (name) => {
    socket.emit("loginSuccess", { message: "Login successful", name });
  });

  socket.on("chatMessage", (message) => {
    io.emit("chatMessage", message);
  });

  socket.on("submitAnswer", async (answerData) => {
    // Check if this user is in the kicked list
    const username = answerData.username;
    if (kickedUsers.includes(username)) {
      // If user is kicked, don't process their answer and send them a kickedOut event
      console.log(`Rejected answer from kicked user: ${username}`);
      socket.emit("kickedOut", {
        message: "You have been kicked out and cannot submit answers.",
      });
      return;
    }

    votes[answerData.option] = (votes[answerData.option] || 0) + 1;

    // Track which student answered what
    const studentAnswer = {
      username: answerData.username,
      option: answerData.option,
      pollId: answerData.pollId,
    };

    // Find if the selected option is correct
    const processedAnswer = await voteOnOption(
      answerData.pollId,
      answerData.option,
      studentAnswer
    );

    console.log("Processed answer with correctness:", processedAnswer);

    // Send updated votes to all clients
    io.emit("pollResults", votes);

    // Send student answer data only to teachers
    io.emit("studentAnswerSubmitted", processedAnswer || studentAnswer);
  });

  socket.on("disconnect", () => {
    console.log("🔌❌ User disconnected:", socket.id);
    console.log("👥 Remaining connected clients:", io.engine.clientsCount);
  });
});

app.get("/", (req, res) => {
  res.send("Polling System Backend");
});

app.post("/teacher-login", (req, res) => {
  TeacherLogin(req, res);
});

app.get("/polls/:teacherUsername", (req, res) => {
  getPolls(req, res);
});

server.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
