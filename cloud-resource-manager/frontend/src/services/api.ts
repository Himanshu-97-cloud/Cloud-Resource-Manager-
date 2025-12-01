// API client for backend
const API_BASE = "https://cloud-resource-manager.onrender.com";

const BASE_URL = "http://127.0.0.1:8000";

export async function fetchResources() {
  const res = await fetch(`${API_BASE}/resources`);
  return res.json();
}

export async function createResource(payload: any) {
  const res = await fetch(`${API_BASE}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateResource(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/resources/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteResource(id: number) {
  return fetch(`${API_BASE}/resources/${id}`, {
    method: "DELETE",
  });
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function fetchLogs() {
  const res = await fetch(`${API_BASE}/logs`);
  return res.json();
}

export async function fetchMetrics(resourceId: number) {
  const res = await fetch(`${BASE_URL}/resources/${resourceId}/metrics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics: ${res.status}`);
  }
  return res.json();
}
