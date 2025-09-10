const { withAuth } = require("../utils/tokenValidator");
const Issue = require("../models/Issue");

const issueHandlers = (socket) => {
  socket.on(
    "getIssues",
    withAuth(async (_, callback) => {
      const issuesData = await Issue.find();

      callback(issuesData);
    })
  );

  socket.on(
    "getIssue",
    withAuth(async (data, callback) => {
      const { issueNumber } = data;

      if (!issueNumber) {
        callback({ error: "No issue number!" });
      }

      const issueData = await Issue.findOne({ issueNumber: issueNumber });

      if (!issueData) {
        callback({ error: "No issue found!" });
      }

      callback(issueData);
    })
  );
};

module.exports = issueHandlers;
