import { useEffect, useState } from "react";
import socket from "../shared/api/socket";

export function useClients() {
  const [clientRows, setClientRows] = useState({});
  const [tagColors, setTagColors] = useState({});

  useEffect(() => {
    socket.emit(
      "needClientData",
      {
        token: localStorage.getItem("token"),
      },
      (data) => {
        setClientRows(data["allClients"]);
      }
    );

    socket.emit(
      "getTagColors",
      { token: localStorage.getItem("token") },
      (data) => {
        setTagColors(data);
      }
    );

    socket.on("updateTagColors", (data) => {
      setTagColors(data);
    });

    socket.on("clientsUpdate", (data) => {
      setClientRows(data);
    });
  }, []);

  const removeTag = (item, client) => {
    socket.emit(
      "removeTag",
      {
        token: localStorage.getItem("token"),
        clientId: client.id,
        tag: item,
      },
      (data) => {
        console.log(data);
      }
    );
  };

  const addTag = (clientId, tagName, tagColor) => {
    socket.emit("addTag", {
      token: localStorage.getItem("token"),
      clientId,
      tag: {
        tagName,
        tagColor,
      },
    });
  };

  return {
    clientRows,
    tagColors,
    removeTag,
    addTag,
  };
}
