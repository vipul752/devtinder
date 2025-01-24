const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./src/config/database");
const http = require("http");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Importing Routes
const authRouter = require("./src/routes/authRouter");
const profileRouter = require("./src/routes/profileRouter");
const connectionRouter = require("./src/routes/connection");
const userRouter = require("./src/routes/userRouter");
const { paymentRouter } = require("./src/routes/payment");
const chatRouter = require("./src/routes/chatRouter");

// Socket.IO initialization
const { initialiseSocket } = require("./src/utils/socket");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// HTTP Server instance
const server = http.createServer(app);

// Initialize Socket.IO with the server
initialiseSocket(server);

app.get("/", (req, res) => {
  res.send("Server is running");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
// Connect to the database
connectDB();
