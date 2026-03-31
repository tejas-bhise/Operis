const LOCAL = "http://localhost:8000";
const PROD = "https://operis-backend-yrko.onrender.com";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? LOCAL : PROD);

export async function fetchDigest() {
  const res = await fetch(`${API_BASE_URL}/digest/latest`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health/latest`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}