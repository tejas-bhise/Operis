const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = "https://operis-backend.onrender.com"
export async function fetchDigest() {
  const res = await fetch(`${BASE}/digest/latest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}