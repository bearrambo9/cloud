import { Button, SimpleGrid, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import socket from "../../shared/api/socket";
import IssueCard from "../../components/IssueCard/IssueCard";

function Issues() {
  const [issues, setIssues] = useState([]);
  const [archivedIssues, setArchivedIssues] = useState([]);
  const [viewState, setViewState] = useState("open");

  useEffect(() => {
    socket.emit(
      "getIssues",
      {
        token: localStorage.getItem("token"),
      },
      (data) => {
        setIssues(data.open);
        setArchivedIssues(data.closed);
      }
    );
  }, []);

  const issueCards = issues.map((issue) => (
    <IssueCard
      key={issue.issueNumber}
      name={issue.name}
      timestamp={issue.timestamp}
      priority={issue.priority}
      title={issue.title}
      description={issue.description}
      number={issue.issueNumber}
      status={issue.status}
    />
  ));

  const archivedIssueCards = archivedIssues.map((issue) => (
    <IssueCard
      key={issue.issueNumber}
      name={issue.name}
      timestamp={issue.timestamp}
      priority={issue.priority}
      title={issue.title}
      description={issue.description}
      number={issue.issueNumber}
      status={issue.status}
    />
  ));

  return (
    <div>
      <Button
        onClick={() => {
          viewState == "open" ? setViewState("archived") : setViewState("open");
        }}
        size="lg"
        p="xs"
        variant="transparent"
        mb="md"
      >
        See {viewState == "open" ? "archived" : "open"} issues
      </Button>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} style={{ width: "100%" }}>
        {viewState == "open" ? issueCards : archivedIssueCards}
      </SimpleGrid>
    </div>
  );
}

export default Issues;
