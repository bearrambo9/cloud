const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  os: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  fingerprint: {
    type: String,
    required: false,
  },
  tags: {
    type: Array,
    required: false,
  },
  last_seen: {
    type: Date,
    required: true,
  },
  connected: {
    type: Boolean,
    required: false,
  },
  socket: {
    type: String,
    required: false,
  },
  lat: {
    type: Number,
    required: false,
  },
  lng: {
    type: Number,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  region: {
    type: String,
    required: false,
  },
});

const Client = mongoose.model("Client", ClientSchema, "Clients");
module.exports = Client;
