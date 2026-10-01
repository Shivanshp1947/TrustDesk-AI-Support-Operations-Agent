const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const DEMO_TOKEN =
  import.meta.env.VITE_DEMO_TOKEN || "trustdesk-demo-token";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEMO_TOKEN}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with ${response.status}`);
  }

  return data;
}

export const api = {
  getTickets: () => request("/tickets"),

  getTicket: (ticketId) => request(`/tickets/${ticketId}`),

  runTriage: (ticketId) =>
    request(`/tickets/${ticketId}/triage`, {
      method: "POST",
    }),

  generateDraft: (ticketId) =>
    request(`/tickets/${ticketId}/draft`, {
      method: "POST",
    }),

  runAgent: (ticketId) =>
    request("/agent-runs", {
      method: "POST",
      body: JSON.stringify({ ticket_id: ticketId }),
    }),

  getTrace: (runId) => request(`/traces/${runId}`),

  getAction: (actionId) => request(`/actions/${actionId}`),

  approveAction: (actionId, reason = "Approved from TrustDesk UI") =>
    request(`/actions/${actionId}/approve`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  rejectAction: (actionId, reason = "Rejected from TrustDesk UI") =>
    request(`/actions/${actionId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  startEvaluation: () =>
    request("/eval/run", {
      method: "POST",
    }),

  getEvaluation: (evalRunId) => request(`/eval/${evalRunId}`),
};

export { API_BASE_URL };
