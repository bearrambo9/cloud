import {
  ActionIcon,
  Avatar,
  Code,
  Group,
  Menu,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import classes from "./Navbar.module.css";
import { IconChevronRight, IconLogout } from "@tabler/icons-react";
import navData from "../../api/navData";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../../api/socket";

function Navbar() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const links = navData.map((item) => (
    <a
      className={classes.link}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(item.link)}
      key={item.title}
    >
      <Group>
        {item.icon}
        <span>{item.title}</span>
      </Group>
    </a>
  ));

  useEffect(() => {
    socket.emit(
      "getUserData",
      { token: localStorage.getItem("token") },
      (data) => {
        if (!data.error) {
          setUser(data);
        } else {
          console.log(data);
        }
      }
    );
  }, []);

  function logout(event) {
    event.preventDefault();
    localStorage.removeItem("token");
    location.reload();
  }

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Title>Cloud</Title>
          <Code fw={700}>v0.0.1</Code>
        </Group>
        {links}
      </div>
      <div className={classes.footer}>
        <Menu position="right" width={200} shadow="md">
          <Menu.Target>
            <UnstyledButton className={classes.user}>
              <Group>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                    {user.name}
                  </Text>
                  <Text c="dimmed" fw={500} size="xs">
                    {user.role}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {user.email}
                  </Text>
                </div>

                <IconChevronRight size={14} stroke={1.5} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              style={{ zIndex: "10000" }}
              color={"red"}
              onClick={(e) => {
                logout(e);
              }}
              leftSection={<IconLogout size={14} />}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </nav>
  );
}

export default Navbar;
