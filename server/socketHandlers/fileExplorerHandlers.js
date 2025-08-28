const { withAuth } = require("../utils/tokenValidator");
const Client = require("../models/Client");
const User = require("../models/User");
const File = require("../models/File");
const fs = require("fs");
const path = require("path");

const fileExplorerHandlers = (socket, io) => {
  socket.on("uploadData", async (data) => {
    try {
      const clientId = socket.data.clientId;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      const fileResult = await File.findOne({
        clientId: clientId,
        status: "inProgress",
      });

      var clone = fileResult.files;

      for (const fileName in fileResult.files) {
        clone[fileName] = {
          completed: data[fileName],
        };
      }

      await File.updateOne(
        { _id: fileResult._id },
        { files: clone, status: "completed" }
      );

      const email = fileResult.creator;
      const creatorClient = await User.findOne({ email: email });
      const client = await Client.findOne({ id: clientId });

      clone.creator = creatorClient.name;
      clone.username = client.username;

      await File.deleteOne({ clientId: clientId, status: "completed" });

      for (const fileName in fileResult.files) {
        if (fileName !== "creator" && fileName !== "username") {
          try {
            fs.unlink(
              path.join(__dirname, "../", "tempUploads") +
                `/${fileName}-${clientId}`,
              (err) => {
                if (err) {
                  console.log(err);
                  return err;
                }
              }
            );
          } catch (ex) {
            console.log(ex);
            return;
          }
        }
      }

      io.emit("uploadData", clone);
    } catch (ex) {
      console.log(ex);
      return;
    }
  });

  socket.on(
    "getClientPathData",
    withAuth(async (data, callback) => {
      const { clientId, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      if (!path) {
        callback({ error: "No path" });
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            console.log(`Client not found: ${clientId}`);
            return;
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          target.emit("getPathData", { path: path }, (pathData) => {
            callback(pathData);
          });
        }
      } catch {
        callback({ error: "Couldn't find target!" });
      }
    })
  );

  socket.on(
    "renameClientPath",
    withAuth(async (data, callback) => {
      const { clientId, path, newName } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      if (!path) {
        callback({ error: "No path" });
      }

      if (!newName) {
        callback({ error: "No newName" });
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            console.log(`Client not found: ${clientId}`);
            return;
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          if (!target) {
            callback({ error: "No target" });
          }

          target.emit("renamePath", { path: path, newName: newName });

          callback();
        }
      } catch {
        callback({ error: "Couldn't find target!" });
      }
    })
  );

  socket.on(
    "deleteClientPath",
    withAuth(async (data, callback) => {
      const { clientId, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            console.log(`Client not found: ${clientId}`);
            return;
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          target.emit("deletePath", { path: path });

          callback();
        }
      } catch {
        callback({ error: "Couldn't find target!" });
      }
    })
  );

  socket.on(
    "getClientFileData",
    withAuth(async (data, callback) => {
      const { clientId, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      if (!path) {
        callback({ error: "No path" });
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            console.log(`Client not found: ${clientId}`);
            return;
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          target.emit("getFileData", { path: path }, (fileData) => {
            callback(fileData);
          });
        }
      } catch {
        callback({ error: "Couldn't find target!" });
      }
    })
  );

  socket.on(
    "getClientRoot",
    withAuth(async (data, callback) => {
      try {
        const { clientId } = data;

        if (!clientId) {
          callback({ error: "No clientId" });
        }

        const client = await Client.findOne({ id: clientId });

        if (!client) {
          console.log(`Client not found: ${clientId}`);
          return;
        }

        const clientSocketString = client.socket;
        const target = io.sockets.sockets.get(clientSocketString);

        target.emit("getRoot", (root) => {
          callback(root);
        });
      } catch {
        callback({ error: "Couldn't find target!" });
      }
    })
  );
};

module.exports = fileExplorerHandlers;
