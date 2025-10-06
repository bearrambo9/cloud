const { withAuth } = require("../utils/tokenValidator");
const Issue = require("../models/Issue");

const issueHandlers = (socket) => {
  socket.on(
    "setIssueStatus",
    withAuth(async (data, callback) => {
      const { issueNumber, status } = data;

      if (!issueNumber) {
        return callback({ error: "No issue number!" });
      }

      if (!status) {
        return callback({ error: "No issue status!" });
      }

      console.log(data);

      const result = await Issue.updateOne(
        { issueNumber: issueNumber },
        { status: status }
      );

      callback({ success: true });
    })
  );

  socket.on(
    "getIssues",
    withAuth(async (_, callback) => {
      const issuesData = await Issue.find().sort({ timestamp: -1 });

      const open = issuesData.filter((issue) => issue.status === "open");
      const closed = issuesData.filter((issue) => issue.status === "closed");

      callback({ open, closed });
    })
  );

  socket.on(
    "getIssue",
    withAuth(async (data, callback) => {
      const { issueNumber } = data;

      if (!issueNumber) {
        return callback({ error: "No issue number!" });
      }

      const issueData = await Issue.findOne({ issueNumber: issueNumber });

      if (!issueData) {
        return callback({ error: "No issue found!" });
      }

      callback(issueData);
    })
  );
};

module.exports = issueHandlers;
