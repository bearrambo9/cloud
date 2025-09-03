import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";

const navData = [
  { link: "/", title: "Dashboard", icon: <IconHome size={22} /> },
  { link: "/clients", title: "Clients", icon: <IconUser size={22} /> },
  { link: "/issues", title: "Issues", icon: <IconMessage size={22} /> },
];

export default navData;
