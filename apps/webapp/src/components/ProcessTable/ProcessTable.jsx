import { ActionIcon, Table } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import socket from "../../shared/api/socket";
import { useParams } from "react-router-dom";
import { useProcessContextMenu } from "../../hooks/useProcessContextMenu";
import { ProcessContextMenu } from "../ProcessContextMenu/ProcessContextMenu";

function ProcessTable({ processes }) {
  const params = useParams();
  const { menuState, ref, handleContextMenu, closeMenu } =
    useProcessContextMenu();

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

  function handleOpenInExplorer(process) {
    socket.emit(
      "getClientProcessLocation",
      {
        processId: process.pid,
        clientId: params.clientId.replace(":", ""),
        token: localStorage.getItem("token"),
      },
      (path) => {
        window.opener.location = `/explorer/${params.clientId.replace(
          ":",
          ""
        )}?path=${encodeURIComponent(path)}`;
      }
    );
    closeMenu();
  }

  const rows = processes.map((process) => {
    return (
      <Table.Tr
        key={process.pid}
        onContextMenu={(e) => handleContextMenu(e, process)}
      >
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
    <div>
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

      <ProcessContextMenu
        menuState={menuState}
        menuRef={ref}
        onClose={closeMenu}
        onOpenInExplorer={handleOpenInExplorer}
      />
    </div>
  );
}

export default ProcessTable;
