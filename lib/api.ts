import { getBackendUrl } from "@/lib/backend-url";

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    for (const key of ["message", "error", "detail"]) {
      if (typeof record[key] === "string" && record[key].length > 0) {
        return record[key];
      }
    }
  }

  return fallback;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl =
    typeof window === "undefined" ? getBackendUrl() : "/api/proxy";
  const url = `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new ApiError("The API returned an invalid JSON response.", response.status, error);
    }
    payload = undefined;
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, response.statusText || "The API request failed."),
      response.status,
      payload,
    );
  }

  return payload as T;
}
