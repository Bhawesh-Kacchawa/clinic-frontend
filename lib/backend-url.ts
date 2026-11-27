export function getBackendUrl(): string {
  return (
    process.env.API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://clinic-backend-w9g6.onrender.com"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")
  );
}
