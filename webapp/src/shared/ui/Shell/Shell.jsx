import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Navbar from "../Navbar/Navbar";

function Shell({ children, name, icon }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <AppShell
        padding="md"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Header>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </AppShell.Header>

        <AppShell.Navbar>
          <Navbar />
        </AppShell.Navbar>

        <AppShell.Main>
          <Group>
            <Title my={"lg"} fw={400} c={"dimmed"}>
              {name}
            </Title>
          </Group>
          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

export default Shell;
