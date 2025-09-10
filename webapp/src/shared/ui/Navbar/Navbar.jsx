import { Code, Group, Title } from "@mantine/core";
import classes from "./Navbar.module.css";
import { IconLogout } from "@tabler/icons-react";
import navData from "../../api/navData";
import { useNavigate } from "react-router-dom";

function Navbar() {
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
        <a href="#" className={classes.link} onClick={(event) => logout(event)}>
          <Group>
            <IconLogout size={22} />
            <span>Logout</span>
          </Group>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
