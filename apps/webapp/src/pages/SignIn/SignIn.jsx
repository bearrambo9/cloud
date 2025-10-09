import {
  Anchor,
  Container,
  Title,
  Text,
  Paper,
  TextInput,
  PasswordInput,
  Button,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import axios from "axios";

function SignIn() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
  });

  async function login(values) {
    try {
      const { data } = await axios.post("/login", values);

      if (data.error) {
        notifications.show({
          title: "Error",
          color: "red",
          icon: <IconX size={20} />,
          message: data.error,
        });
      } else {
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.reload();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw="bold">
        Welcome back!
      </Title>

      <Text ta="center" c="dimmed" my="md" size="md">
        Forgot your password? <Anchor>Contact Admin</Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30}>
        <form onSubmit={form.onSubmit((values) => login(values))}>
          <TextInput
            label="Email"
            placeholder="your_email@cloud.com"
            required
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            key={form.key("password")}
            {...form.getInputProps("password")}
            mt="md"
          />
          <Button type="submit" fullWidth mt="xl" radius={"xs"}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default SignIn;
