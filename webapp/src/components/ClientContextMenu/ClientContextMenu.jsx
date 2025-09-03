import { Paper, Menu } from "@mantine/core";
import {
  IconSettings,
  IconBrandPowershell,
  IconTag,
  IconFolder,
  IconDeviceDesktop,
  IconChartLine,
} from "@tabler/icons-react";
import { openTaskManager } from "../../shared/utils/openTaskManager";

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
              <Menu.Sub.Item
                disabled={menuState.client.connected ? false : true}
                leftSection={<IconSettings size={14} />}
              >
                Administration
              </Menu.Sub.Item>
            </Menu.Sub.Target>

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
              <Menu.Item
                leftSection={<IconChartLine size={14} />}
                onClick={() => openTaskManager(menuState.client.id)}
              >
                Task Manager
              </Menu.Item>
            </Menu.Sub.Dropdown>
          </Menu.Sub>

          <Menu.Item
            disabled={menuState.client.connected ? false : true}
            leftSection={<IconTag size={14} />}
            onClick={onAddTagClick}
          >
            Add Tag
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
}
