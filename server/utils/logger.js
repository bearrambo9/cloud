const winston = require("winston");
const fs = require("fs");

if (!fs.existsSync("../logs")) {
  fs.mkdirSync("logs");
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "cloud-rat-server" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/server.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "audit" },
  transports: [new winston.transports.File({ filename: "logs/audit.log" })],
});

module.exports = { logger, auditLogger };
