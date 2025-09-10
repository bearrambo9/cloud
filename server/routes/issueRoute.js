const express = require("express");
const cors = require("cors");

module.exports = (io) => {
  const router = express.Router();
  const { uploadIssue } = require("../controllers/issueController");

  router.use(
    cors({
      credentials: true,
      origin: "http://localhost:5173",
    })
  );

  router.post("/uploadIssue", uploadIssue(io));

  return router;
};
