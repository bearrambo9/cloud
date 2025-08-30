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
        return;
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

      if (!client) {
        callback({ error: "No client" });
        return;
      }

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
                  console.log(`Error uploading ${fileName}`);
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
        return;
      }

      if (!path) {
        callback({ error: "No path" });
        return;
      }

      try {
        if (path) {
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

          target.emit("getPathData", { path: path }, (pathData) => {
            callback(pathData);
          });
        }
      } catch {
        callback({ error: "Couldn't find target!" });
        return;
      }
    })
  );

  socket.on(
    "renameClientPath",
    withAuth(async (data, callback) => {
      const { clientId, path, newName } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!path) {
        callback({ error: "No path" });
        return;
      }

      if (!newName) {
        callback({ error: "No newName" });
        return;
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            console.log("No client");
            return;
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          if (!target) {
            callback({ error: "No target" });
            return;
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
        return;
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            callback({ error: "No clientId" });
            return;
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          if (!target) {
            callback({ error: "No target" });
            return;
          }

          target.emit("deletePath", { path: path });

          callback();
        }
      } catch {
        callback({ error: "No target" });
      }
    })
  );

  socket.on(
    "getClientFileData",
    withAuth(async (data, callback) => {
      const { clientId, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!path) {
        callback({ error: "No path" });
        return;
      }

      try {
        if (path) {
          const client = await Client.findOne({ id: clientId });

          if (!client) {
            console.log(`No client`);
          }

          const clientSocketString = client.socket;
          const target = io.sockets.sockets.get(clientSocketString);

          if (!target) {
            callback({ error: "No target" });
            return;
          }

          target.emit("getFileData", { path: path }, (fileData) => {
            callback(fileData);
          });
        }
      } catch {
        callback({ error: "No target" });
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
          return;
        }

        const client = await Client.findOne({ id: clientId });

        if (!client) {
          callback({ error: "No client" });
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

  socket.on(
    "createClientFile",
    withAuth(async (data, callback) => {
      const { clientId, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!path) {
        callback({ error: "No path" });
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
        callback({ error: "No client" });
        return;
      }

      target.emit("createFile", { path: path }, () => {
        callback();
      });
    })
  );

  socket.on(
    "createClientFolder",
    withAuth(async (data, callback) => {
      const { clientId, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!path) {
        callback({ error: "No path" });
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

      target.emit("createFolder", { path: path }, () => {
        callback();
      });
    })
  );

  socket.on(
    "getClientShortcut",
    withAuth(async (data, callback) => {
      const { clientId, shortcutName } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!shortcutName) {
        callback({ error: "No shortcut name" });
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

      target.emit("getShortcut", { shortcutName: shortcutName }, (data) => {
        callback(data);
      });
    })
  );

  socket.on(
    "saveClientFileContents",
    withAuth(async (data, callback) => {
      const { clientId, fileData, path } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
        return;
      }

      if (!path) {
        callback({ error: "No path" });
        return;
      }

      if (!fileData) {
        callback({ error: "No fileData" });
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

      target.emit(
        "saveFileContents",
        { fileData: fileData, path: path },
        (data) => {
          callback(data);
        }
      );
    })
  );
};

module.exports = fileExplorerHandlers;
