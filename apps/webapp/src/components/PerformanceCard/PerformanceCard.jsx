import { Card, Stack, Group, Text } from "@mantine/core";
import { ResponsiveContainer, LineChart, Line } from "recharts";

function PerformanceCard({ title, subtitle, percentage, data, type }) {
  return (
    <Card padding="xs" style={{ width: 200, height: 120 }}>
      <Stack gap={4}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="sm" fw={500}>
              {title}
            </Text>
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          </div>
          <Text size="xs">{percentage}</Text>
        </Group>

        <ResponsiveContainer
          width="100%"
          height={60}
          style={{ pointerEvents: "none" }}
        >
          <LineChart data={data}>
            {type === "network" ? (
              <>
                <Line
                  type="monotone"
                  dataKey="send"
                  stroke="#228be6"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="recv"
                  stroke="#40c057"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke="#228be6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Stack>
    </Card>
  );
}

export default PerformanceCard;
