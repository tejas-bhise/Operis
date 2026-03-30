const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchDigest() {
  const res = await fetch(`${BASE}/digest/latest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}