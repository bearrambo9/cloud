import { Group, Stack, Table, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../shared/api/socket";

function ServicesTable() {
  const params = useParams();
  const [services, setServices] = useState([]);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    socket.emit(
      "getServices",
      {
        token: localStorage.getItem("token"),
        clientId: params.clientId.replace(":", ""),
      },
      (services) => {
        if (!services.error) {
          setServices(services);
        }
      }
    );
  }, []);

  function setService(service) {
    setDescription(service.description);
    setName(service.serviceName);
  }

  const rows = services.map((service) => (
    <Table.Tr
      onClick={() => setService(service)}
      key={service.serviceName}
      style={{ cursor: "pointer" }}
    >
      <Table.Td>{service.serviceName}</Table.Td>
      <Table.Td>{service.serviceDisplayName}</Table.Td>
      <Table.Td>
        <Text lineClamp={2}>{service.description}</Text>
      </Table.Td>
      <Table.Td>{service.status}</Table.Td>
      <Table.Td>{service.processId || "N/A"}</Table.Td>
      <Table.Td>{service.startType}</Table.Td>
      <Table.Td>{service.group}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px",
        height: "calc(100vh - 200px)",
      }}
    >
      <div style={{ width: 250, flexShrink: 0 }}>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Selected Service
          </Text>

          {name ? (
            <>
              <Text fw="bold" size="lg">
                {name}
              </Text>
              <Text
                size="sm"
                mt="md"
                style={{
                  height: "calc(100vh - 300px)",
                  overflowY: "auto",
                  wordWrap: "break-word",
                }}
              >
                {description || "No description available"}
              </Text>
            </>
          ) : (
            <Text c="dimmed" fs="italic">
              Click a service to view details
            </Text>
          )}
        </Stack>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Table.ScrollContainer style={{ height: "100%" }}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Service Name</Table.Th>
                <Table.Th>Display Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>PID</Table.Th>
                <Table.Th>Startup Type</Table.Th>
                <Table.Th>Group</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
    </div>
  );
}

export default ServicesTable;
