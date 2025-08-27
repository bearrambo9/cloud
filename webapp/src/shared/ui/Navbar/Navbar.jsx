import { Code, Group, Title } from "@mantine/core";
import { useState } from "react";
import classes from "./Navbar.module.css";

const data = [
  { link: "/", title: "Dashboard" },
  { link: "/clients", title: "Clients" },
  { link: "/admin", title: "Admin" },
];

function Navbar() {
  const links = data.map((item) => (
    <a className={classes.link} href={item.link} key={item.title}>
      <span>{item.title}</span>
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
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
