import { ActionIcon, Table } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import socket from "../../shared/api/socket";
import { useParams } from "react-router-dom";

function ProcessTable({ processes }) {
  const params = useParams();

  function killProcess(pid) {
    socket.emit(
      "killClientProcess",
      {
        token: localStorage.getItem("token"),
        clientId: params.clientId.replace(":", ""),
        pid: pid,
      },
      (data) => {
        console.log(data);
      }
    );
  }

  const rows = processes.map((process) => {
    return (
      <Table.Tr key={process.pid}>
        <Table.Td>
          <ActionIcon
            onClick={() => killProcess(process.pid)}
            className="x"
            color="red"
            variant="transparent"
          >
            <IconX size={14} />
          </ActionIcon>
        </Table.Td>
        <Table.Td>{process.name}</Table.Td>
        <Table.Td>{process.status}</Table.Td>
        <Table.Td>{process.cpuPercent}</Table.Td>
        <Table.Td>{process.memory}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>CPU</Table.Th>
          <Table.Th>Memory</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

export default ProcessTable;
