import { Group } from "@mantine/core";
import { IconFolderFilled, IconFileFilled } from "@tabler/icons-react";

function FileExplorerLeaf({
  name,
  path,
  onPathClick,
  isFolder,
  onContextMenu,
}) {
  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const item = {
      name,
      path,
      isFolder,
    };

    onContextMenu(event, item);
  };

  return (
    <Group
      onContextMenu={handleContextMenu}
      onClick={() => onPathClick(path, isFolder)}
      gap={5}
      style={{
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        userSelect: "none",
      }}
      className="file-explorer-leaf"
    >
      {isFolder ? (
        <IconFolderFilled color={"yellow"} size={14} stroke={2.5} />
      ) : (
        <IconFileFilled size={14} stroke={2.5} />
      )}
      <span>{name}</span>
    </Group>
  );
}

export { FileExplorerLeaf };
