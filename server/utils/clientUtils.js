const Client = require("../models/Client");

async function sendClientsToSockets(io) {
  const records = await Client.find();
  io.to("clientUpdates").emit("clientsUpdate", records);
}

async function setConnectionStatus(id, status, io) {
  await Client.updateOne({ id }, { connected: status });
  const records = await Client.find();
  io.to("clientUpdates").emit("clientsUpdate", records);
}

async function updateClient(id, update, io) {
  await Client.updateOne({ id }, update);
  const records = await Client.find();
  io.to("clientUpdates").emit("clientsUpdate", records);
}

module.exports = {
  sendClientsToSockets,
  setConnectionStatus,
  updateClient,
};
