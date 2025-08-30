import { Group } from "@mantine/core";
import {
  IconFolderFilled,
  IconFileFilled,
  IconBrandPython,
  IconFileTypeHtml,
  IconFileTypeCss,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileTypeJpg,
  IconFileTypePng,
  IconPhoto,
  IconVideo,
  IconMusic,
  IconFileTypeJs,
  IconFileTypeTs,
} from "@tabler/icons-react";
import { useState } from "react";

function FileExplorerLeaf({
  name,
  path,
  onPathClick,
  isFolder,
  onContextMenu,
}) {
  const [fileExtension, setFileExtension] = useState("");
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

  const getFileIcon = (fileName, isFolder) => {
    if (isFolder) {
      return <IconFolderFilled color={"yellow"} size={14} stroke={2.5} />;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();

    const iconMap = {
      py: <IconBrandPython size={14} stroke={2.5} />,
      js: <IconFileTypeJs size={14} stroke={2.5} />,
      jsx: <IconFileTypeJs size={14} stroke={2.5} />,
      ts: <IconFileTypeTs size={14} stroke={2.5} />,
      tsx: <IconFileTypeTs size={14} stroke={2.5} />,
      html: <IconFileTypeHtml size={14} stroke={2.5} />,
      css: <IconFileTypeCss size={14} stroke={2.5} />,
      pdf: <IconFileTypePdf size={14} stroke={2.5} />,
      doc: <IconFileTypeDoc size={14} stroke={2.5} />,
      docx: <IconFileTypeDoc size={14} stroke={2.5} />,
      jpg: <IconFileTypeJpg size={14} stroke={2.5} />,
      jpeg: <IconFileTypeJpg size={14} stroke={2.5} />,
      png: <IconFileTypePng size={14} stroke={2.5} />,
      gif: <IconPhoto size={14} stroke={2.5} />,
      mp3: <IconVideo size={14} stroke={2.5} />,
      wav: <IconMusic size={14} stroke={2.5} />,
      mp4: <IconVideo size={14} stroke={2.5} />,
      avi: <IconVideo size={14} stroke={2.5} />,
    };

    return iconMap[extension] || <IconFileFilled size={14} stroke={2.5} />;
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
      {getFileIcon(name, isFolder)}
      <span>{name}</span>
    </Group>
  );
}

export { FileExplorerLeaf };
