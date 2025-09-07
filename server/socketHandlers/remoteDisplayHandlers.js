const Client = require("../models/Client");
const { withAuth } = require("../utils/tokenValidator");

const remoteDisplayHandlers = (socket, io) => {
  socket.on("displayData", (data) => {
    io.to(socket.data.clientId).emit("displayData", data);
  });

  socket.on(
    "getDisplays",
    withAuth(async (data, callback) => {
      const { clientId } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
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
        target.emit("getDisplays", data, (result) => {
          callback(result);
        });
      } else {
        callback({ error: `No target ${clientSocketString}` });
      }
    })
  );

  socket.on(
    "changeDisplay",
    withAuth(async (data) => {
      const { clientId } = data;

      if (!clientId) {
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("changeDisplay", data);
      }
    })
  );

  socket.on(
    "displayMouseMove",
    withAuth(async (data) => {
      const { clientId } = data;

      if (!clientId) {
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("mouseMove", data);
      }
    })
  );

  socket.on(
    "displayKeyPress",
    withAuth(async (data) => {
      const { clientId } = data;

      if (!clientId) {
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("keyPress", data);
      }
    })
  );

  socket.on(
    "displayMouseClick",
    withAuth(async (data) => {
      const { clientId } = data;

      if (!clientId) {
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        target.emit("mouseClick", data);
      }
    })
  );

  socket.on(
    "stopRemoteDisplay",
    withAuth(async (data, callback) => {
      const { clientId } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        callback({ error: "Client not found" });
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        socket.leave(`rd-${clientId}`);
        target.emit("stopRemoteDisplay");
        callback({ status: "successful" });
      } else {
        callback({ error: "No target" });
      }
    })
  );

  socket.on(
    "startRemoteDisplay",
    withAuth(async (data, callback) => {
      const { clientId } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      const client = await Client.findOne({ id: clientId });

      if (!client) {
        console.log(`Client not found: ${clientId}`);
        callback({ error: "Client not found" });
        return;
      }

      const clientSocketString = client.socket;
      const target = io.sockets.sockets.get(clientSocketString);

      if (target) {
        socket.join(`rd-${clientId}`);
        target.emit("startRemoteDisplay", { clientId: clientId });
        callback({ status: "connected", client: client });
      } else {
        callback({ error: `No target ${clientSocketString}` });
      }
    })
  );
};

module.exports = remoteDisplayHandlers;
