import { Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import PerformanceCard from "../PerformanceCard/PerformanceCard";

function Performance({ performanceData }) {
  const [chartData, setChartData] = useState({
    cpu: [],
    memory: [],
    disk: [],
    network: [],
  });

  const [previousNetworkData, setPreviousNetworkData] = useState(null);
  const [networkStats, setNetworkStats] = useState({ send: 0, recv: 0 });

  useEffect(() => {
    if (performanceData && Object.keys(performanceData).length > 0) {
      const timestamp = Date.now();

      let sendKbps = 0;
      let recvKbps = 0;

      if (performanceData.network && previousNetworkData) {
        const timeDiff =
          performanceData.network.timestamp - previousNetworkData.timestamp;

        const sendSpeed =
          (performanceData.network.bytesSent - previousNetworkData.bytesSent) /
          timeDiff;
        const recvSpeed =
          (performanceData.network.bytesRecv - previousNetworkData.bytesRecv) /
          timeDiff;

        sendKbps = ((sendSpeed * 8) / 1000).toFixed(1);
        recvKbps = ((recvSpeed * 8) / 1000).toFixed(1);

        setNetworkStats({ send: sendKbps, recv: recvKbps });
      }

      setChartData((prev) => ({
        cpu: [
          ...prev.cpu.slice(-59),
          {
            time: timestamp,
            value:
              parseFloat(performanceData.cpu?.percentage?.replace("%", "")) ||
              0,
          },
        ],
        memory: [
          ...prev.memory.slice(-59),
          {
            time: timestamp,
            value:
              parseFloat(
                performanceData.memory?.percentage?.replace("%", "")
              ) || 0,
          },
        ],
        disk: [
          ...prev.disk.slice(-59),
          {
            time: timestamp,
            value:
              parseFloat(performanceData.disk?.percentage?.replace("%", "")) ||
              0,
          },
        ],
        network: [
          ...prev.network.slice(-59),
          {
            time: timestamp,
            send: parseFloat(sendKbps) || 0,
            recv: parseFloat(recvKbps) || 0,
          },
        ],
      }));
    }

    setPreviousNetworkData(performanceData.network);
  }, [performanceData]);

  return (
    <Stack gap="xs" style={{ padding: 16, width: 250 }}>
      {Object.entries(performanceData).map(([key, item]) => (
        <PerformanceCard
          key={key}
          title={item.title}
          subtitle={
            key === "network"
              ? `↑ ${networkStats.send} kbps ↓ ${networkStats.recv} kbps`
              : key === "disk"
              ? `${parseFloat(item.percentage) || 0}%`
              : item.subtitle
          }
          percentage={item.percentage}
          data={chartData[key] || []}
          type={key}
        />
      ))}
    </Stack>
  );
}

export default Performance;
