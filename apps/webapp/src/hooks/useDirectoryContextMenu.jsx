import { useState } from "react";
import { useClickOutside } from "@mantine/hooks";

export function useDirectoryContextMenu() {
  const [dirContextMenuState, setMenuState] = useState({
    opened: false,
    x: 0,
    y: 0,
    path: null,
  });

  const dirContextMenuRef = useClickOutside(() =>
    setMenuState({ ...dirContextMenuState, opened: false })
  );

  const handleDirContextMenu = (e, path) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    setMenuState({
      opened: true,
      x: x,
      y: y,
      path: path,
    });
  };

  const closeDirMenu = () => {
    setMenuState({ ...dirContextMenuState, opened: false });
  };

  return {
    dirContextMenuState,
    dirContextMenuRef,
    handleDirContextMenu,
    closeDirMenu,
  };
}
