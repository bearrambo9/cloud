const Client = require("../models/Client");
const { withAuth } = require("../utils/tokenValidator");

const servicesHandlers = (socket, io) => {
  socket.on(
    "getServices",
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

      if (!target) {
        callback({ error: "No target" });
      }

      target.emit("getServices", (data) => {
        callback(data);
      });
    })
  );
};

module.exports = servicesHandlers;
