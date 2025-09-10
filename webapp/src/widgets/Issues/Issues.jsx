import { SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import socket from "../../shared/api/socket";
import IssueCard from "../../components/IssueCard/IssueCard";

function Issues() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    socket.emit(
      "getIssues",
      {
        token: localStorage.getItem("token"),
      },
      (data) => {
        setIssues(data);
      }
    );
  }, []);

  const issueCards = issues.map((issue) => (
    <IssueCard
      key={issue.issueNumber}
      name={issue.name}
      timestamp={issue.timestamp}
      title={issue.title}
      description={issue.description}
      number={issue.issueNumber}
      priority={issue.priority}
    />
  ));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} style={{ width: "100%" }}>
      {issueCards}
    </SimpleGrid>
  );
}

export default Issues;
