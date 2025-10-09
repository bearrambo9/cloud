import { useState } from "react";
import { useClickOutside } from "@mantine/hooks";

export function useContextMenu() {
  const [menuState, setMenuState] = useState({
    opened: false,
    x: 0,
    y: 0,
    client: null,
  });

  const ref = useClickOutside(() =>
    setMenuState({ ...menuState, opened: false })
  );

  const handleContextMenu = (e, client) => {
    e.preventDefault();
    setMenuState({
      opened: true,
      x: e.clientX,
      y: e.clientY,
      client: client,
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
