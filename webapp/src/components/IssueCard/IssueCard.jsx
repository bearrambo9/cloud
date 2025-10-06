import { Card, Group, Text, Badge, ColorSwatch } from "@mantine/core";
import styles from "./IssueCard.module.css";
import { useNavigate } from "react-router-dom";

function IssueCard({
  name,
  status,
  timestamp,
  priority,
  title,
  description,
  number,
}) {
  const navigate = useNavigate();

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

  return (
    <Card
      className={styles.issueCard}
      onClick={() => {
        navigate(`/issue/${number}`);
      }}
    >
      <Group justify="space-between">
        <Group gap={"sm"}>
          <Text size={"lg"}>
            {name} (#{number})
          </Text>
        </Group>
        <Group gap={"sm"}>
          <Text c={"dimmed"} fs={"italic"} size={"md"}>
            {getTimeAgo(timestamp)}
          </Text>
          <ColorSwatch
            color={
              priority == "low"
                ? "var(--mantine-color-gray-5)"
                : priority == "medium"
                ? "var(--mantine-color-orange-5)"
                : priority == "high" && "var(--mantine-color-red-5)"
            }
          />
          <Badge color={status == "open" ? "green" : "red"} size={"md"}>
            {status}
          </Badge>
        </Group>
      </Group>
      <Text mt={"md"} c={"dimmed"} fs={"italic"} size={"md"}>
        Title
      </Text>
      <Text size={"md"}>{title}</Text>
      <Text mt={"sm"} c={"dimmed"} fs={"italic"} size={"md"}>
        Description
      </Text>
      <Text size={"md"} lineClamp={2}>
        {description}
      </Text>
    </Card>
  );
}

export default IssueCard;
