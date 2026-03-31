const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export async function fetchDigest() {
  const res = await fetch(`${API_BASE_URL}/digest/latest`);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health/latest`);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}