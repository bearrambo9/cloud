const express = require("express");
const cors = require("cors");

module.exports = (io) => {
  const router = express.Router();
  const { uploadFiles } = require("../controllers/uploadController");

  router.use(
    cors({
      credentials: true,
      origin: "http://localhost:5173",
    })
  );

  router.post("/uploadFiles", uploadFiles(io));

  return router;
};
