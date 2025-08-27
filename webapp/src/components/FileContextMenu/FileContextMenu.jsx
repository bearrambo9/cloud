import { Paper, Menu } from "@mantine/core";
import {
  IconFolderOpen,
  IconTrash,
  IconEdit,
  IconDownload,
} from "@tabler/icons-react";

export function FileContextMenu({
  menuState,
  menuRef,
  onClose,
  onOpen,
  onDelete,
  onRename,
}) {
  if (!menuState.opened) return null;

  const { item } = menuState;

  return (
    <Paper
      ref={menuRef}
      shadow="md"
      style={{
        position: "fixed",
        top: menuState.y,
        left: menuState.x,
        zIndex: 9999,
        minWidth: 150,
      }}
    >
      <Menu
        opened={menuState.opened}
        onClose={onClose}
        withinPortal={false}
        trigger="manual"
      >
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconFolderOpen size={14} />}
            onClick={() => onOpen(item)}
          >
            Open
          </Menu.Item>

          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={() => onRename(item)}
          >
            Rename
          </Menu.Item>

          <Menu.Divider />
          <Menu.Item
            leftSection={<IconTrash size={14} />}
            onClick={() => onDelete(item)}
            color="red"
          >
            Delete
          </Menu.Item>
          <Menu.Item leftSection={<IconDownload size={14} />} color="">
            Download
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
}
