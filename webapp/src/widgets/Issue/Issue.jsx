import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Image,
  Text,
  Title,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import socket from "../../shared/api/socket";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

function Issue() {
  const params = useParams();
  const navigate = useNavigate();
  const [issueData, setIssueData] = useState();

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

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
        }
      }
    );
  }, []);

  return (
    <div>
      {issueData ? (
        <>
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
                onClick={() => openFile(file)}
                key={file.name}
              >
                {file.name}
              </Badge>
            ))}
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
