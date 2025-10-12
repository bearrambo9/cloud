const File = require("../models/File");
const Client = require("../models/Client");
const { validateToken } = require("../utils/tokenValidator");
const path = require("path");
const fs = require("fs").promises;
const fsp = require("fs");
const tempUploads = path.join(__dirname, "../tempUploads");

const uploadFiles = (io) => async (req, res) => {
  try {
  	if (!fsp.existsSync(tempUploads)) {
  		fs.mkdir(tempUploads);
  	}
  	
    const tokenValidation = await validateToken(req.body.token);

    if (!tokenValidation.valid) {
      return res.json({ error: "Invalid token" });
    }

    const { clientId, targetPath, files } = req.body;

    if (!clientId || !targetPath || !files || files.length === 0) {
      return res.json({ error: "Missing required fields" });
    }

    const fileMap = {};
    files.forEach((file) => {
      fileMap[file.name] = { completed: false };
    });

    const result = await File.create({
      clientId,
      targetPath,
      status: "inProgress",
      files: fileMap,
      creator: tokenValidation.user.email,
    });

    await Promise.all(
      files.map(async (file) => {
        const base64Data = file.data.includes(",")
          ? file.data.split(",")[1]
          : file.data;

        const buffer = Buffer.from(base64Data, "base64");
        const safeName = path.basename(file.name);

        await fs.writeFile(
          path.join(tempUploads, `${safeName}-${clientId}`),
          buffer
        );
      })
    );

    console.log("Uploaded all files!");

    const client = await Client.findOne({ id: clientId });

    if (!client) {
      return res.json({ error: "Client not found" });
    }

    const links = {};
    files.forEach((file) => {
      const safeName = path.basename(file.name);
      links[`/${safeName}-${clientId}`] = `${targetPath}/${file.name}`;
    });

    io.to(client.socket).emit("downloadFiles", { urls: links });

    return res.json({ success: true, message: "Files uploaded successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    return res.json({ error: "Failed to upload files" });
  }
};

module.exports = {
  uploadFiles,
};
