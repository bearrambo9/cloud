import { Container, Divider, Text } from "@mantine/core";
import ProcessTable from "../ProcessTable/ProcessTable";

function Processes({ backgroundProcessesList, processesList }) {
  return (
    <Container p="md">
      <div>
        <Text size="lg" c="blue">
          Apps ({processesList.length})
        </Text>
        <ProcessTable processes={processesList} />
      </div>
      <Divider my="md" />
      <div>
        <Text size="lg" c="blue">
          Background Processes ({backgroundProcessesList.length})
        </Text>
        <ProcessTable processes={backgroundProcessesList} />
      </div>
    </Container>
  );
}

export default Processes;
