import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Text,
  Title,
  Modal,
  Image,
  Textarea,
  Button,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import socket from "../../shared/api/socket";
import { IconCheck, IconChevronLeft, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

function Issue() {
  const params = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(undefined);
  const [fileData, setFileData] = useState("");
  const [clientData, setClientData] = useState([]);
  const [issueData, setIssueData] = useState();
  const [opened, { open, close }] = useDisclosure(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays > 0)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    if (diffInHours > 0)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInMinutes > 0)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  function isImage(filename) {
    const exts = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
      ".ico",
    ];
    const lower = filename.toLowerCase();
    return exts.some((ext) => lower.endsWith(ext));
  }

  useEffect(() => {
    socket.emit(
      "getIssue",
      {
        token: localStorage.getItem("token"),
        issueNumber: params.issueNumber.replace(":", ""),
      },
      (data) => {
        if (!data.error) {
          setIssueData(data);
          socket.emit(
            "getClientData",
            {
              token: localStorage.getItem("token"),
              userId: data.clientId,
            },
            (clientData) => setClientData(clientData)
          );
        }
      }
    );
  }, []);

  function closeIssue() {
    socket.emit(
      "setIssueStatus",
      {
        issueNumber: issueData.issueNumber,
        status: "closed",
        token: localStorage.getItem("token"),
      },
      (data) => {
        if (!data.error) {
          notifications.show({
            title: "Success",
            icon: <IconCheck />,
            color: "green",
            message: "Closed issue successfully!",
          });
        } else {
          notifications.show({
            title: "Error",
            icon: <IconX />,
            color: "red",
            message: "Failed to close issue!",
          });
        }
      }
    );
  }

  useEffect(() => {
    if (file) {
      const uint8Array = new Uint8Array(file.data.data);
      if (isImage(file.name)) {
        let dataUrl = "";
        for (let i = 0; i < uint8Array.length; i++) {
          dataUrl += String.fromCharCode(uint8Array[i]);
        }
        setFileData(dataUrl);
        open();
      } else {
        try {
          let text = new TextDecoder("utf-8").decode(uint8Array);
          if (text.startsWith("data:")) {
            const base64Data = text.split(",")[1];
            text = atob(base64Data);
          }
          setFileData(text);
          open();
        } catch {
          setFileData("[Cannot display file: non-text binary]");
          open();
        }
      }
    }
  }, [file]);

  return (
    <div>
      {issueData ? (
        <>
          <Modal
            opened={opened}
            centered
            onClose={() => {
              close();
              setFile(undefined);
              setFileData("");
            }}
            title={file && file.name}
          >
            {file && isImage(file.name) && fileData ? (
              <Image src={fileData} />
            ) : (
              <Textarea value={fileData} readOnly minRows={10} autosize />
            )}
          </Modal>
          <Group>
            <Group gap={"xs"}>
              <ActionIcon
                onClick={() => navigate("/issues")}
                variant={"transparent"}
              >
                <IconChevronLeft size={28} color={"white"} />
              </ActionIcon>
              <Title fw="bold">
                {issueData.name} | Issue #{issueData.issueNumber}
              </Title>
            </Group>
            <Badge color="gray" size={"lg"}>
              {issueData.priority}
            </Badge>
            <Badge
              color={issueData.status === "open" ? "green" : "red"}
              size={"lg"}
            >
              {issueData.status}
            </Badge>
            <Text size={"lg"} fs="italic" c="dimmed">
              {getTimeAgo(issueData.timestamp)}
            </Text>
          </Group>
          <Title my={"sm"} fw={"lighter"}>
            Issue Details
          </Title>
          <Text mt={"md"} size={"lg"} fs={"italic"} color={"dimmed"}>
            Issue Title
          </Text>
          <Text size={"xl"}>{issueData.title}</Text>
          <Text mt={"md"} size={"lg"} fs={"italic"} color={"dimmed"}>
            Issue Description
          </Text>
          <Text size={"xl"}>{issueData.description}</Text>
          <Text mt={"md"} size={"lg"} fs={"italic"} color={"dimmed"}>
            Client ID
          </Text>
          <Text size={"xl"}>{issueData.clientId}</Text>
          <Text mt={"md"} size={"lg"} fs={"italic"} color={"dimmed"}>
            Attached Files
          </Text>
          <Group my={"md"}>
            {issueData.files.map((file) => (
              <Badge
                style={{ cursor: "pointer" }}
                onClick={() => setFile(file)}
                key={file.name}
              >
                {file.name}
              </Badge>
            ))}
          </Group>
          <Group>
            <Button
              disabled={!clientData.connected}
              onClick={() => navigate(`/display/${clientData.id}`)}
              color={clientData.connected && "green"}
            >
              Connect to Client
            </Button>
            <Button
              disabled={issueData.status === "closed"}
              color="red"
              onClick={() => closeIssue()}
            >
              Close Issue
            </Button>
          </Group>
          <Divider my={"md"} />
        </>
      ) : (
        <Text size={"xl"}>No issue found!</Text>
      )}
    </div>
  );
}

export default Issue;
