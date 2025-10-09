import { useState } from "react";
import { useClickOutside } from "@mantine/hooks";

export function useProcessContextMenu() {
  const [menuState, setMenuState] = useState({
    opened: false,
    x: 0,
    y: 0,
    process: null,
  });

  const ref = useClickOutside(() =>
    setMenuState({ ...menuState, opened: false })
  );

  const handleContextMenu = (e, process) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    setMenuState({
      opened: true,
      x: x,
      y: y,
      process: process,
    });
  };

  const closeMenu = () => {
    setMenuState({ ...menuState, opened: false });
  };

  return {
    menuState,
    ref,
    handleContextMenu,
    closeMenu,
  };
}
