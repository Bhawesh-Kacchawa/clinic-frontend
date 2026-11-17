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
  const isQueueBookingStatusUpdate =
    request.method === "PATCH" &&
    path.length === 6 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "bookings" &&
    path[4].length > 0 &&
    path[5] === "status";
  const isQueueSessionAction =
    request.method === "POST" &&
    path.length === 6 &&
    path[0] === "api" &&
    path[1] === "clinics" &&
    path[3] === "sessions" &&
    ["MORNING", "EVENING"].includes(path[4].toUpperCase()) &&
    ["call-next", "undo"].includes(path[5]);
  const isQueueAction = isQueueBookingStatusUpdate || isQueueSessionAction;

  if (
    !isBookingCreate &&
    !isBookingLookup &&
    !isClinicSessions &&
    !isClinicBookings &&
    !isClinicBookingDelete &&
    !isClinicSessionManagement &&
    !isQueueAction
  ) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  const headers = new Headers({ Accept: "application/json" });
  if (isClinicSessionManagement || isQueueAction || isClinicBookings) {
    const token = request.cookies.get("access_token")?.value;
    if (!token && (isClinicSessionManagement || isQueueAction || isClinicBookings)) {
      return Response.json({ message: "Authentication required." }, { status: 401 });
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let method = request.method;
  let requestBody: string | undefined =
    request.method === "GET" ? undefined : await request.text();
  let queueActionPath: string | null = null;
  if (isQueueBookingStatusUpdate) {
    const actions: Record<string, string> = {
      SERVING: "call",
      SKIPPED: "skip",
      WAITING: "requeue",
      NO_SHOW: "no-show",
    };
    let status = "";
    try {
      status = String(JSON.parse(requestBody || "{}").status ?? "").toUpperCase();
    } catch {}
    const action = actions[status];
    if (!action) {
      return Response.json({ message: "Unsupported status." }, { status: 400 });
    }
    const id = encodeURIComponent(path[4]);
    queueActionPath =
      action === "call"
        ? `api/staff/queue/call/${id}`
        : `api/staff/queue/${id}/${action}`;
    method = "POST";
    requestBody = undefined;
  }

  let sessionPath: string | null = null;
  if (isClinicSessionManagement) {
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(requestBody || "{}");
    } catch {
      return Response.json({ message: "Invalid JSON body." }, { status: 400 });
    }
    if (isClinicSessionCreate) {
      sessionPath = "api/staff/sessions";
      body = {
        date: new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date()),
        avgMinutes: 15,
        bookingOpensAt: new Date().toISOString(),
        ...body,
      };
    } else {
      if (typeof body.id !== "string" || !body.id) {
        return Response.json({ message: "Session id is required." }, { status: 400 });
      }
      if (isClinicSessionUpdate) {
        sessionPath = "api/staff/sessions";
        method = "PATCH";
      } else {
        sessionPath = `api/staff/sessions/${encodeURIComponent(body.id)}/status`;
        body = { action: body.bookingStatus };
      }
    }
    requestBody = JSON.stringify(body);
  }

  const upstreamPath =
    queueActionPath ??
    sessionPath ??
    (isClinicBookings
      ? "api/staff/bookings"
      : path.map(encodeURIComponent).join("/"));
  const upstreamUrl = `${API_URL.replace(/\/+$/, "")}/${upstreamPath}${request.nextUrl.search}`;
  const contentType = request.headers.get("content-type");
  if (contentType && !queueActionPath) headers.set("Content-Type", contentType);

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body: requestBody,
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
