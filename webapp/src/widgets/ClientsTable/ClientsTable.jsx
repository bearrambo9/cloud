import { Table } from "@mantine/core";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useClients } from "../../hooks/useClients";
import { ClientRow } from "../../components/ClientRow/ClientRow";
import { AddTagModal } from "../../components/AddTagModal/AddTagModal";
import { ClientContextMenu } from "../../components/ClientContextMenu/ClientContextMenu";

import "./ClientsTable.module.css";

function ClientsTable() {
  const [tagValue, setTagValue] = useState("");
  const [tagColorValue, setTagColorValue] = useState("");

  const [opened, { open, close }] = useDisclosure(false);

  const { menuState, ref, handleContextMenu, closeMenu } = useContextMenu();
  const {
    clientRows,
    tagColors,
    removeTag,
    addTag: addTagToClient,
  } = useClients();

  const rows = Object.entries(clientRows).map(([_, client]) => (
    <ClientRow
      key={client.id}
      client={client}
      tagColors={tagColors}
      onContextMenu={handleContextMenu}
      onRemoveTag={removeTag}
    />
  ));

  function addTag(client) {
    addTagToClient(client.id, tagValue, tagColorValue);
    setTagValue("");
    setTagColorValue("");
  }

  function onReverseShellClick(client) {
    location.href = `/shell/${client}`;
  }

  function onFileExplorerClick(client) {
    location.href = `/explorer/${client}`;
  }

  function onRemoteDisplayClick(client) {
    location.href = `/display/${client}`;
  }

  return (
    <>
      {menuState.client ? (
        <AddTagModal
          opened={opened}
          onClose={close}
          client={menuState.client}
          tagValue={tagValue}
          setTagValue={setTagValue}
          tagColorValue={tagColorValue}
          setTagColorValue={setTagColorValue}
          onAddTag={addTag}
        />
      ) : (
        ""
      )}

      <Table.ScrollContainer maxHeight={500} minWidth={500}>
        <Table highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>IP Address</Table.Th>
              <Table.Th>User@PC</Table.Th>
              <Table.Th>OS</Table.Th>
              <Table.Th>ID</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Tags</Table.Th>
              <Table.Th>Last Seen</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <ClientContextMenu
        menuState={menuState}
        menuRef={ref}
        onClose={closeMenu}
        onAddTagClick={open}
        onReverseShellClick={onReverseShellClick}
        onRemoteDisplayClick={onRemoteDisplayClick}
        onFileExplorerClick={onFileExplorerClick}
      />
    </>
  );
}

export default ClientsTable;
