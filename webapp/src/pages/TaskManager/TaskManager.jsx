import { Button, Divider, Group, LoadingOverlay, Tabs } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../../shared/api/socket";
import { useDisclosure } from "@mantine/hooks";
import Processes from "../../components/Processes/Processes";
import Performance from "../../components/Performance/Performance";

function TaskManager() {
  const params = useParams();
  const [visible, { toggle }] = useDisclosure(true);
  const [processes, setProcesses] = useState([]);
  const [backgroundProcesses, setBackgroundProcesses] = useState([]);
  const [performanceData, setPerformanceData] = useState({});

  useEffect(() => {
    const sort = (data) => {
      var apps = [];
      var backgroundApps = [];

      data.forEach((process) => {
        if (process.type == "app") {
          apps.push(process);
        } else {
          backgroundApps.push(process);
        }
      });

      return [apps, backgroundApps];
    };

    socket.emit(
      "startTaskManager",
      {
        token: localStorage.getItem("token"),
        clientId: params.clientId.replace(":", ""),
      },
      (data) => {
        try {
          const sorted = sort(data.processes);

          if (visible) {
            toggle();
          }

          setProcesses(sorted[0]);
          setBackgroundProcesses(sorted[1]);
          setPerformanceData(data.performanceData || {});
        } catch {
          return;
        }
      }
    );

    socket.on("taskManagerData", (data) => {
      const sorted = sort(data.processes);

      if (visible) {
        toggle();
      }

      setProcesses(sorted[0]);
      setBackgroundProcesses(sorted[1]);
      setPerformanceData(data.performanceData || {});
    });

    return () => {
      socket.off("taskManagerData");
    };
  }, []);

  return (
    <div>
      <LoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Group>
        <Button variant="transparent">File</Button>
        <Button variant="transparent">View</Button>
      </Group>
      <Divider />
      <Tabs defaultValue="processes">
        <Tabs.List
          style={{
            flexWrap: "nowrap",
            overflowX: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <Tabs.Tab value="processes">Processes</Tabs.Tab>
          <Tabs.Tab value="performance">Performance</Tabs.Tab>
          <Tabs.Tab value="startup">Startup</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="services">Services</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="processes">
          <Processes
            backgroundProcessesList={backgroundProcesses}
            processesList={processes}
          />
        </Tabs.Panel>
        <Tabs.Panel value="performance">
          <Performance performanceData={performanceData} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default TaskManager;
