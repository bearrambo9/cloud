const File = require("../models/File");
const Client = require("../models/Client");
const { validateToken } = require("../utils/tokenValidator");
const path = require("path");
const fs = require("fs").promises;
const tempUploads = path.join(__dirname, "../tempUploads");

const uploadFiles = (io) => async (req, res) => {
  const tokenValidation = await validateToken(req.body.token);
  var files = {};

  req.body.files.forEach((file) => {
    files[file.name] = { completed: false };
  });

  if (tokenValidation.valid) {
    try {
      const result = await File.create({
        clientId: req.body.clientId,
        targetPath: req.body.targetPath,
        status: "inProgress",
        files: files,
        creator: tokenValidation.user.email,
      });

      try {
        await Promise.all(
          req.body.files.map(async (file) => {
            const base64 = file["data"];
            const decodedBase64 = atob(base64);

            await fs.writeFile(
              tempUploads + `/${file.name}-${req.body.clientId}`,
              decodedBase64
            );
          })
        );

        console.log("Uploaded all files!");
        const client = await Client.findOne({ id: req.body.clientId });

        var links = {};

        req.body.files.map((file) => {
          links[
            `/${file.name}-${req.body.clientId}`
          ] = `${req.body.targetPath}/${file.name}`;
        });

        io.to(client.socket).emit("downloadFiles", {
          urls: links,
        });
      } catch (error) {
        console.log(`Failed to upload files: ` + error);
        return res.json({ error: "Failed to upload file" });
      }
    } catch (error) {
      console.log(`Failed to upload files: ` + error);
      return res.json({ error: "Failed to upload file" });
    }
  } else {
    return res.json({ error: "Invalid token" });
  }
};

module.exports = {
  uploadFiles,
};
