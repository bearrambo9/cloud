const Client = require("../models/Client");
const { withAuth } = require("../utils/tokenValidator");

const ptyHandlers = (socket, io) => {
  socket.on(
    "ptyConnectClient",
    withAuth(async (data, callback) => {
      const { clientId } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        callback({ error: `Client not found ${clientId}` });
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("connectPty", data);
        callback({ status: "connected" });
        socket.join(clientId);
      } else {
        callback({ error: `No target ${clientSocketString}` });
      }
    })
  );

  socket.on(
    "ptyInput",
    withAuth(async (data) => {
      const { clientId, input } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      if (!input) {
        callback({ error: "No input" });
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("ptyInput", { input: input });
      } else {
        console.log(`No target client ID: ${clientId}`);
      }
    })
  );

  socket.on("ptyData", (data) => {
    io.to(socket.data.clientId).emit("ptyData", data);
  });

  socket.on(
    "ptyStop",
    withAuth(async (data, callback) => {
      const { clientId } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        callback({ error: `Client not found ${clientId}` });
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("ptyStop", (clientData) => {
          callback(clientData);
        });
      } else {
        callback({ error: `No target found ${clientSocketString}` });
      }
    })
  );
};

module.exports = ptyHandlers;
