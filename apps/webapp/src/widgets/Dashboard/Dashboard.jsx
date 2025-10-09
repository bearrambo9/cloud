import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { useEffect, useState } from "react";
import socket from "../../shared/api/socket";
import "leaflet/dist/leaflet.css";
import { Text } from "@mantine/core";

const serverIcon = new L.divIcon({
  html: '<div style="font-size: 24px;">🖥️</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  className: "serverIcon",
});

const clientIcon = new L.divIcon({
  html: '<div style="font-size: 24px;">👤</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  className: "serverIcon",
});

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [serverData, setServerData] = useState();

  useEffect(() => {
    socket.emit(
      "getServerData",
      { token: localStorage.getItem("token") },
      (data) => {
        setServerData(data);
      }
    );

    socket.emit(
      "needClientData",
      { token: localStorage.getItem("token") },
      (response) => {
        if (response.allClients) {
          setClients(response.allClients);
        }
      }
    );
  }, []);

  const AnimatedPolyline = ({ client, serverData }) => {
    const [dashOffset, setDashOffset] = useState(0);

    useEffect(() => {
      if (client.connected) {
        const interval = setInterval(() => {
          setDashOffset((prev) => (prev + 2) % 40);
        }, 80);

        return () => clearInterval(interval);
      } else {
        setDashOffset(0);
      }
    }, [client.connected]);

    return (
      <Polyline
        key={`line-${client.id}`}
        positions={[
          [serverData.lat, serverData.lng],
          [client.lat, client.lng],
        ]}
        pathOptions={{
          color: client.connected ? "#16a34a" : "#dc2626",
          weight: client.connected ? 4 : 2,
          opacity: client.connected ? 0.8 : 0.4,
          dashArray: "10, 10",
          dashOffset: client.connected ? -dashOffset : 0,
        }}
      />
    );
  };

  return (
    <div style={{ height: "600px" }}>
      <Text size={"xl"} my={"md"}>
        Client Map
      </Text>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: "500px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {serverData &&
          clients.map((client) =>
            client.lat && client.lng ? (
              <AnimatedPolyline
                key={`line-${client.id}`}
                client={client}
                serverData={serverData}
              />
            ) : null
          )}

        {serverData && (
          <Marker position={[serverData.lat, serverData.lng]} icon={serverIcon}>
            <Popup>
              <div>
                <strong>Cloud Server</strong>
                <br />
                {serverData.ip}
                <br />
                {serverData.city}, {serverData.country}
                <br />
                <em>This is where the host server is located</em>
              </div>
            </Popup>
          </Marker>
        )}

        {clients.map((client) =>
          client.lat && client.lng ? (
            <Marker
              key={client.id}
              position={[client.lat, client.lng]}
              icon={clientIcon}
            >
              <Popup>
                <div>
                  <strong>{client.username}</strong>
                  <br />
                  {client.ip}
                  <br />
                  {client.city}, {client.country}
                  <br />
                  <strong>Status:</strong>
                  {client.connected ? " Online" : " Offline"}
                  <br />
                  <strong>OS:</strong> {client.os}
                  <br />
                  <strong>Last Seen: </strong>
                  {new Date(client.last_seen).toLocaleString()}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default Dashboard;
