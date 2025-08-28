const Client = require("../models/Client");
const axios = require("axios");
const { withAuth } = require("../utils/tokenValidator");

async function getServerLocationData() {
  try {
    const response = await axios.get("https://ipapi.co/json/");

    if (!response.data.latitude || !response.data.longitude) {
      console.log("Bad geo data recieved");
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
    console.log(error);
    throw error;
  }
}

const dataHandlers = (socket, io) => {
  socket.on(
    "getClientData",
    withAuth(async (data, callback) => {
      const { userId } = data;
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
