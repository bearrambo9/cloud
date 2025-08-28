const Client = require("../models/Client");
const Tag = require("../models/Tag");
const { withAuth } = require("../utils/tokenValidator");
const { sendClientsToSockets } = require("../utils/clientUtils");

async function getTagColors() {
  const tags = await Tag.find();
  const tagColorMap = {};

  tags.forEach((tag) => {
    tagColorMap[tag.name] = tag.color;
  });

  return tagColorMap;
}

const tagHandlers = (socket, io) => {
  socket.on(
    "addTag",
    withAuth(async (data, callback) => {
      const { clientId, tag } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      if (!tag) {
        callback({ error: "No tag" });
      }

      try {
        await Tag.create({
          name: tag.tagName,
          color: tag.tagColor,
          usageCount: 1,
        });
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Tag "${tag.tagName}" already exists, skipping creation`);
        } else {
          console.error("Error creating tag:", error);
        }
      }

      const addTagToClientResult = await Client.updateOne(
        { id: clientId },
        { $addToSet: { tags: tag.tagName } }
      );

      if (addTagToClientResult.matchedCount === 0) {
        console.log(`No client found for tag adding: ${clientId}`);
        return;
      }

      const tagColors = await getTagColors();

      io.to("clientUpdates").emit("updateTagColors", tagColors);
      sendClientsToSockets(io);
    })
  );

  socket.on(
    "removeTag",
    withAuth(async (data) => {
      const { clientId, tag } = data;

      if (!clientId) {
        callback({ error: "No clientId" });
      }

      if (!tag) {
        callback({ error: "No tag" });
      }

      const result = await Client.updateOne(
        { id: clientId },
        { $pull: { tags: tag } }
      );

      if (result.matchedCount === 0) {
        console.log(`No client found for tag removal: ${clientId}`);
        return;
      }

      await Tag.findOneAndUpdate({ name: tag }, { $inc: { usageCount: -1 } });

      await Tag.deleteOne({ name: tag, usageCount: 0 });

      sendClientsToSockets(io);
    })
  );

  socket.on(
    "getTagColors",
    withAuth(async (_, callback) => {
      const tagColors = await getTagColors();

      callback(tagColors);
    })
  );
};

module.exports = tagHandlers;
