const Client = require("../models/Client");
const axios = require("axios");
const { withAuth } = require("../utils/tokenValidator");

async function getServerLocationData() {
  try {
    const response = await axios.get("https://ipapi.co/json/");

    if (!response.data.latitude || !response.data.longitude) {
      throw new Error("Invalid geolocation data received");
    }

    return {
      ip: response.data.ip,
      lat: parseFloat(response.data.latitude),
      lng: parseFloat(response.data.longitude),
      city: response.data.city,
      country: response.data.country_name,
      region: response.data.region,
    };
  } catch (error) {
    throw error;
  }
}

const dataHandlers = (socket, io) => {
  socket.on(
    "getClientData",
    withAuth(async (data, callback) => {
      const { userId } = data;
      console.log("Test");
      const record = await Client.findOne({ id: userId });
      callback(record);
    })
  );

  socket.on(
    "getServerData",
    withAuth(async (_, callback) => {
      const serverLocationData = await getServerLocationData();
      callback(serverLocationData);
    })
  );
};

module.exports = dataHandlers;
