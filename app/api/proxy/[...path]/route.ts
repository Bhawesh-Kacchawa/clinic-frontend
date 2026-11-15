import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  const isBookingCreate =
    request.method === "POST" && path.join("/") === "api/public/bookings";
  const isBookingLookup =
    request.method === "GET" &&
    path.length === 4 &&
    path[0] === "api" &&
    path[1] === "public" &&
    path[2] === "bookings";
  const isClinicSessions =
    request.method === "GET" &&
    path.length === 5 &&
    path[0] === "api" &&
    path[1] === "public" &&
    path[2] === "clinics" &&
    path[4] === "sessions";
  const isClinicBookings =
    request.method === "GET" &&
    path.length === 4 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "bookings";
  const isClinicBookingDelete =
    request.method === "DELETE" &&
    path.length === 5 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "bookings" &&
    path[4].length > 0;
  const isClinicSessionCreate =
    request.method === "POST" &&
    path.length === 4 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "sessions";
  const isClinicSessionUpdate =
    request.method === "PUT" &&
    path.length === 5 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "sessions" &&
    ["MORNING", "EVENING"].includes(path[4].toUpperCase());
  const isClinicSessionStatusUpdate =
    request.method === "PATCH" &&
    path.length === 6 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "sessions" &&
    ["MORNING", "EVENING"].includes(path[4].toUpperCase()) &&
    path[5] === "status";
  const isClinicSessionManagement =
    isClinicSessionCreate ||
    isClinicSessionUpdate ||
    isClinicSessionStatusUpdate;

  if (
    !isBookingCreate &&
    !isBookingLookup &&
    !isClinicSessions &&
    !isClinicBookings &&
    !isClinicBookingDelete &&
    !isClinicSessionManagement
  ) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  const headers = new Headers({ Accept: "application/json" });
  if (isClinicSessionManagement) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return Response.json({ message: "Authentication required." }, { status: 401 });
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const upstreamUrl = `${API_URL.replace(/\/+$/, "")}/${path
    .map(encodeURIComponent)
    .join("/")}${request.nextUrl.search}`;
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
