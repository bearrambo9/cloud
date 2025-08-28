const Client = require("../models/Client");
const axios = require("axios");
const uuid = require("uuid4");
const { withAuth } = require("../utils/tokenValidator");
const {
  setConnectionStatus,
  updateClient,
  sendClientsToSockets,
} = require("../utils/clientUtils");

const clientHandlers = (socket, io) => {
  socket.on("clientConnection", async (data, callback) => {
    data.ip = data.ip || socket.handshake.address;
    data.last_seen = new Date();

    const { ip, username, os, id, fingerprint, last_seen } = data;

    if (!ip || username || id || fingerprint || last_seen) {
      callback({ error: "Please complete all fields" });
      return;
    }

    if (ip && username && os && id) {
      const checkId = await Client.findOne({ id });
      const checkFingerprint = await Client.findOne({ fingerprint });

      await setConnectionStatus(id, true, io);

      await Client.updateOne({ fingerprint }, { socket: socket.id });

      try {
        const locationResponse = await axios.get(
          `https://ipapi.co/${ip}/json/`,
          {
            timeout: 5000,
          }
        );

        if (locationResponse.data.latitude && locationResponse.data.longitude) {
          data.lat = parseFloat(locationResponse.data.latitude);
          data.lng = parseFloat(locationResponse.data.longitude);
          data.city = locationResponse.data.city;
          data.country = locationResponse.data.country_name;
          data.region = locationResponse.data.region;
        }
      } catch (error) {
        data.lat = null;
        data.lng = null;
        data.city = null;
        data.country = null;
        data.region = null;
      }

      await updateClient(
        id,
        {
          last_seen: data.last_seen,
          lat: data.lat,
          lng: data.lng,
          city: data.city,
          country: data.country,
          region: data.region,
        },
        io
      );

      if (checkFingerprint && !checkId) {
        const newId = uuid();

        const newIdExists = await Client.findOne({ newId });

        if (!newIdExists) {
          await Client.updateOne({ fingerprint }, { id: newId });

          callback({ newId: newId });
        }
      }

      if (!checkFingerprint && !checkId) {
        await Client.create({
          ip: ip,
          username: username,
          os: os,
          id: id,
          last_seen: last_seen,
          connected: true,
          fingerprint: fingerprint,
          socket: socket.id,
          lat: data.lat,
          lng: data.lng,
          city: data.city,
          country: data.country,
          region: data.region,
        });
      }

      socket.data.clientId = id;

      sendClientsToSockets(io);
    } else {
      console.log("Unsuccessful client connection attempt");
      socket.disconnect();
    }
  });

  socket.on("disconnect", async () => {
    const id = socket.data.clientId;
    if (id) {
      await setConnectionStatus(id, false, io);
      await updateClient(id, { socket: "" }, io);
    }
  });

  socket.on(
    "needClientData",
    withAuth(async (_, callback) => {
      socket.join("clientUpdates");
      const records = await Client.find();
      callback({ allClients: records });
    })
  );
};

module.exports = clientHandlers;
