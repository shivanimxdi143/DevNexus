// Central backend API configuration
// In production (Vercel), VITE_API_URL points to the Render backend service
// In development, it defaults to http://localhost:3000
export const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
