import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import axios from "axios";

import SignIn from "./pages/SignIn/SignIn";
import Dashboard from "./widgets/Dashboard/Dashboard";
import ProtectedRoute from "./shared/ui/ProtectedRoute/ProtectedRoute";
import UnprotectedRoute from "./shared/ui/ProtectedRoute/UnauthorizedRoute/UnauthorizedRoute";
import Shell from "./shared/ui/Shell/Shell";
import ClientsTable from "./widgets/ClientsTable/ClientsTable";
import ReverseShell from "./pages/ReverseShell/ReverseShell";
import FileExplorer from "./widgets/FileExplorer/FileExplorer";
import RemoteDisplay from "./pages/RemoteDisplay/RemoteDisplay";
import TaskManager from "./pages/TaskManager/TaskManager";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <MantineProvider forceColorScheme="dark">
      <Notifications />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <UnprotectedRoute>
                <SignIn />
              </UnprotectedRoute>
            }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Shell children={<ClientsTable />} name={"Clients"} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shell/:clientId"
            element={
              <ProtectedRoute>
                <ReverseShell />
              </ProtectedRoute>
            }
          />

          <Route
            path="/explorer/:clientId"
            element={
              <ProtectedRoute>
                <Shell children={<FileExplorer />} name={"File Explorer"} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/display/:clientId"
            element={
              <ProtectedRoute>
                <RemoteDisplay />
              </ProtectedRoute>
            }
          />

          <Route
            path="/taskmanager/:clientId"
            element={
              <ProtectedRoute>
                <TaskManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell children={<Dashboard />} name={"Dashboard"} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
