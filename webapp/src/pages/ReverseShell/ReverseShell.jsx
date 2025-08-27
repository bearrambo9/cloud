import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import socket from "../../shared/api/socket";
import { useXTerm } from "react-xtermjs";
import { useParams } from "react-router-dom";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircleFilled, IconCheck, IconX } from "@tabler/icons-react";

function ReverseShell() {
  const { instance, ref } = useXTerm();
  const id = useParams();
  const fitAddon = new FitAddon();

  useEffect(() => {
    notifications.show({
      title: "Important Note!",
      icon: <IconAlertCircleFilled />,
      autoClose: false,
      color: "yellow",
      message:
        "Please remember to click the 'stop pty' button at the bottom of the page before exiting!",
    });
  }, []);

  useEffect(() => {
    socket.emit(
      "ptyConnectClient",
      {
        token: localStorage.getItem("token"),
        clientId: id.clientId.replace(":", ""),
      },
      (response) => {
        if (response.status == "connected") {
          instance?.writeln(`[CLOUD] Remote Shell | ${id.clientId}`);
          socket.emit(
            "getClientData",
            {
              token: localStorage.getItem("token"),
              userId: id.clientId.replace(":", ""),
            },
            (client) => {
              if (client) {
                document.title = `shell@${client.username}`;
              }
            }
          );
        } else {
          instance?.writeln(`ERROR: ${response.error}`);
        }
      }
    );

    socket.on("ptyData", (data) => {
      instance?.write(data.data);
    });
  }, [instance]);

  function onData(data) {
    socket.emit("ptyInput", {
      token: localStorage.getItem("token"),
      clientId: id.clientId.replace(":", ""),
      input: data,
    });
  }

  function stopPty() {
    socket.emit(
      "ptyStop",
      {
        token: localStorage.getItem("token"),
        clientId: id.clientId.replace(":", ""),
      },
      (response) => {
        console.log(response);

        if (response.success) {
          instance?.clear("");
          instance?.writeln("\n[CLOUD] Successfully stopped the pty client.");
          instance?.writeln("\n[CLOUD] You will be redirected shortly");
          notifications.clean();

          notifications.show({
            title: "Success",
            icon: <IconCheck />,
            color: "green",
            message: "Successfully terminated pty client!",
          });

          notifications.show({
            title: "Exiting in 3 seconds",
            icon: <IconAlertCircleFilled />,
            autoClose: false,
            color: "yellow",
            message: "You will be redirected shortly",
          });

          setTimeout(() => {
            location.href = "/clients";
          }, 3000);
        } else {
          instance?.clear("");
          instance.writeln(`\n[CLOUD] ERROR: ${response.error}`);
          notifications.show({
            title: "Error!",
            icon: <IconX />,
            color: "red",
            message:
              "Failed to terminate pty client! Check the terminal for the error and report this to an administrator",
          });
        }
      }
    );
  }

  instance?.onData((data) => onData(data));

  useEffect(() => {
    instance?.loadAddon(fitAddon);

    const handleResize = () => {
      fitAddon.fit();
      socket.emit("cls");
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref, instance]);

  return (
    <>
      <div ref={ref} style={{ width: "100%", height: "100vh" }}></div>
      <Button onClick={() => stopPty()} m={"md"}>
        Stop PTY (This will stop it running on the client, click this before
        exiting)
      </Button>
    </>
  );
}

export default ReverseShell;
