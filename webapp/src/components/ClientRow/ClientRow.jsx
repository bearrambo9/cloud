import { Table, Tooltip, ColorSwatch, Badge } from "@mantine/core";

export function ClientRow({ client, tagColors, onContextMenu, onRemoveTag }) {
  return (
    <Table.Tr
      style={client.connected ? { pointerEvents: "all" } : {}}
      onContextMenu={(e) => onContextMenu(e, client)}
    >
      <Table.Td />
      <Table.Td>{client.ip}</Table.Td>
      <Table.Td>{client.username}</Table.Td>
      <Table.Td>{client.os}</Table.Td>
      <Table.Td>{client.id}</Table.Td>
      <Table.Td>
        <Tooltip label={client.connected ? "Connected" : "Not Active"}>
          {client.connected ? (
            <ColorSwatch color="var(--mantine-color-green-5)" />
          ) : (
            <ColorSwatch color="var(--mantine-color-red-5)" />
          )}
        </Tooltip>
      </Table.Td>
      <Table.Td>
        {client.tags.length > 0
          ? client.tags.map((item, index) => (
              <Badge
                color={tagColors[item]}
                leftSection={
                  <button
                    onClick={() => onRemoveTag(item, client)}
                    className={"badgeButton"}
                    style={{ all: "unset" }}
                  >
                    X
                  </button>
                }
                key={index}
              >
                {item}
              </Badge>
            ))
          : "None"}
      </Table.Td>
      <Table.Td>{client.last_seen}</Table.Td>
    </Table.Tr>
  );
}
