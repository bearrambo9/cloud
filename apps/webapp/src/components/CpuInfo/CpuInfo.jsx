import { Divider, Group, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function CpuInfo({ data, chartData }) {
  useEffect(() => {
    console.log("CPU data:", data);
    console.log("Chart data:", chartData);
  });

  return (
    <div
      style={{
        marginRight: "45px",
        minWidth: "450px",
        flex: "1",
        flexShrink: 0,
      }}
    >
      <Group justify={"space-between"}>
        <h1>CPU</h1>
        <h3>{data?.name}</h3>
      </Group>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip
            labelFormatter={(time) => new Date(time).toLocaleTimeString()}
            formatter={(value) => [`${value}%`, "CPU Usage"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#228be6"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <Divider my={"md"} />
      <div>
        <Group>
          <Stack>
            <Group>
              <Stack gap={"xs"}>
                <Text c={"dimmed"}>Speed</Text>
                <Text size={"lg"}>4.20 GHz</Text>
              </Stack>
            </Group>
            <Group>
              <Stack gap={"xs"}>
                <Text c={"dimmed"}>Processes</Text>
                <Text size={"lg"}>271</Text>
              </Stack>
              <Stack gap={"xs"}>
                <Text c={"dimmed"}>Handles</Text>
                <Text size={"lg"}>143167</Text>
              </Stack>
              <Stack gap={"xs"}>
                <Text c={"dimmed"}>Threads</Text>
                <Text size={"lg"}>4327</Text>
              </Stack>
            </Group>
          </Stack>
          <Stack>
            <Stack>
              <Group justify="space-between">
                <Text c={"dimmed"}>Base speed: </Text>
                <Text>{data.baseSpeed}</Text>
              </Group>
              <Group justify="space-between">
                <Text c={"dimmed"}>Sockets: </Text>
                <Text>{data.sockets}</Text>
              </Group>
              <Group justify="space-between">
                <Text c={"dimmed"}>Cores: </Text>
                <Text>{data.cores}</Text>
              </Group>
              <Group justify="space-between">
                <Text c={"dimmed"}>Logical processors: </Text>
                <Text>{data.logicalProcessors}</Text>
              </Group>
            </Stack>
          </Stack>
        </Group>
      </div>
    </div>
  );
}

export default CpuInfo;
