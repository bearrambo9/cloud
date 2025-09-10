const Issue = require("../models/Issue");
const Client = require("../models/Client");

const uploadIssue = (io) => async (req, res) => {
  try {
    const { clientId, timestamp, description, priority, title, files } =
      req.body;

    if (!clientId) {
      return res.json({ error: "No clientId" });
    }

    const client = await Client.findOne({ id: clientId });

    if (!client) {
      return res.json({ error: "clientId Invalid" });
    }

    if (!timestamp) {
      return res.json({ error: "No timestamp" });
    }

    if (!description) {
      return res.json({ error: "No description" });
    }

    if (!priority) {
      return res.json({ error: "No priority" });
    }

    if (!title) {
      return res.json({ error: "No title" });
    }

    const issueCount = await Issue.countDocuments();
    const issueNumber = 1000 + issueCount + 1;

    await Issue.create({
      clientId: clientId,
      timestamp: timestamp,
      name: client.username,
      issueNumber: issueNumber,
      priority: priority,
      description: description,
      title: title,
      files: files,
    });

    io.to("admins").emit("newIssue", {
      name: client.username,
      issueNumber: issueNumber,
    });

    return res.json({ status: "success", issueNumber: issueNumber });
  } catch (error) {
    return res.json({ error: "Failed to upload issue" });
  }
};

module.exports = {
  uploadIssue,
};
