import { Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./DashboardPage";
import TicketDetailsPage from "./TicketDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<DashboardPage mode="overview" />}
      />

      <Route
        path="/workflow"
        element={<DashboardPage mode="workflow" />}
      />

      <Route
        path="/evaluation"
        element={<DashboardPage mode="evaluation" />}
      />

      <Route
        path="/tickets/:ticketId"
        element={<TicketDetailsPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}