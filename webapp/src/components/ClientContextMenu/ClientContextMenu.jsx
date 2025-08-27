// components/ClientContextMenu/ClientContextMenu.jsx
import { Paper, Menu } from "@mantine/core";
import {
  IconSettings,
  IconBrandPowershell,
  IconTag,
  IconFolder,
  IconDeviceDesktop,
} from "@tabler/icons-react";

export function ClientContextMenu({
  menuState,
  menuRef,
  onClose,
  onAddTagClick,
  onReverseShellClick,
  onRemoteDisplayClick,
  onFileExplorerClick,
}) {
  if (!menuState.opened) return null;

  return (
    <Paper
      ref={menuRef}
      shadow="md"
      style={{
        position: "absolute",
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
          <Menu.Sub>
            <Menu.Sub.Target>
              <Menu.Sub.Item leftSection={<IconSettings size={14} />}>
                Administration
              </Menu.Sub.Item>
            </Menu.Sub.Target>

            <Menu.Item
              leftSection={<IconTag size={14} />}
              onClick={onAddTagClick}
            >
              Add Tag
            </Menu.Item>

            <Menu.Sub.Dropdown>
              <Menu.Item
                leftSection={<IconBrandPowershell size={14} />}
                onClick={() => onReverseShellClick(menuState.client.id)}
              >
                Reverse Shell
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFolder size={14} />}
                onClick={() => onFileExplorerClick(menuState.client.id)}
              >
                File Explorer
              </Menu.Item>
              <Menu.Item
                leftSection={<IconDeviceDesktop size={14} />}
                onClick={() => onRemoteDisplayClick(menuState.client.id)}
              >
                Remote Display
              </Menu.Item>
            </Menu.Sub.Dropdown>
          </Menu.Sub>
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
}
