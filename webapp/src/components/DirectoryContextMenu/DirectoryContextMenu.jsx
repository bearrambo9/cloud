import { Paper, Menu } from "@mantine/core";
import {
  IconFolderPlus,
  IconFilePlus,
  IconBrandPowershell,
} from "@tabler/icons-react";

export function DirectoryContextMenu({
  menuState,
  menuRef,
  onClose,
  onCreateFolder,
  onCreateFile,
  onOpenInTerminal,
}) {
  if (!menuState.opened) return null;

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
            leftSection={<IconFolderPlus size={14} />}
            onClick={() => onCreateFolder(menuState.path)}
          >
            New Folder
          </Menu.Item>

          <Menu.Item
            leftSection={<IconFilePlus size={14} />}
            onClick={() => onCreateFile(menuState.path)}
          >
            New File
          </Menu.Item>
          <Menu.Item
            leftSection={<IconBrandPowershell size={14} />}
            onClick={() => onOpenInTerminal(menuState.path)}
          >
            Open in Terminal
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
}
