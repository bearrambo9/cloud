import { Paper, Menu } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";

export function ProcessContextMenu({
  menuState,
  menuRef,
  onClose,
  onOpenInExplorer,
}) {
  if (!menuState.opened) return null;

  const { process } = menuState;

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
            leftSection={<IconFolder size={14} />}
            onClick={() => onOpenInExplorer(process)}
          >
            Open in File Explorer
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
}
