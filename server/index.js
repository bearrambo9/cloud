const express = require("express");
require("dotenv").config();
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const dgram = require("dgram");
const udpServer = dgram.createSocket("udp4");
const path = require("path");
const io = new Server(server, {
  cors: {
    origin: process.env.WEBAPP_URL || "http://localhost:5173",
  },
});
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const clientHandlers = require("./socketHandlers/clientHandlers");
const ptyHandlers = require("./socketHandlers/ptyHandlers");
const tagHandlers = require("./socketHandlers/tagHandlers");
const dataHandlers = require("./socketHandlers/dataHandlers");
const fileExplorerHandlers = require("./socketHandlers/fileExplorerHandlers");
const remoteDisplayHandlers = require("./socketHandlers/remoteDisplayHandlers");
const taskManagerHandlers = require("./socketHandlers/taskManagerHandlers");

mongoose.connect(process.env.MONGO_URL);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

console.log(path.join(__dirname, "tempUploads"));

app.get("/download", (req, res) => {
  const file = req.query.file;
  res.sendFile(path.join(__dirname, "tempUploads", file));
});

app.use("/", require("./routes/authRoute"));
app.use("/", require("./routes/uploadRoute")(io));

// RemoteDisplay UDP Server

udpServer.on("message", (msg) => {
  const frameId = msg.readUInt32BE(0);

  const headerEnd = msg.indexOf(Buffer.from("|"), 12);
  const clientId = msg.slice(12, headerEnd).toString("utf8");
  const jpegData = msg.slice(headerEnd + 1);

  const base64Data = jpegData.toString("base64");

  io.to(`rd-${clientId}`).emit("udpData", {
    frameId: frameId,
    clientId: clientId,
    data: base64Data,
  });
});

io.on("connection", (socket) => {
  clientHandlers(socket, io);
  ptyHandlers(socket, io);
  tagHandlers(socket, io);
  fileExplorerHandlers(socket, io);
  dataHandlers(socket, io);
  remoteDisplayHandlers(socket, io);
  taskManagerHandlers(socket, io);
});

server.listen(process.env.PORT || 3000);
udpServer.bind(process.env.UDP_PORT || 9999);
