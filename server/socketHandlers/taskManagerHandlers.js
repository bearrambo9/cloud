const { withAuth } = require("../utils/tokenValidator");
const Client = require("../models/Client");

const taskManagerHandlers = (socket, io) => {
  socket.on("taskManagerData", (data) => {
    io.to(`tm-${socket.data.clientId}`).emit("taskManagerData", data);
  });

  socket.on(
    "startTaskManager",
    withAuth(async (data, callback) => {
      const { clientId } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        callback({ error: "No client" });
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (!target) {
        callback({ error: "No target" });
        return;
      }
      target.emit("startTaskManager", (data) => {
        socket.join(`tm-${clientId}`);
        callback(data);
      });
    })
  );

  socket.on(
    "killClientProcess",
    withAuth(async (data, callback) => {
      const { clientId, pid } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!pid) {
        callback({ error: "No pid" });
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        callback({ error: "No client" });
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (!target) {
        callback({ error: "No target" });
        return;
      }

      target.emit("killProcess", { pid: pid }, (data) => {
        callback(data);
      });
    })
  );
};

module.exports = taskManagerHandlers;
