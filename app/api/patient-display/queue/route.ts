import { cookies } from "next/headers";
import { ApiError, apiFetch } from "@/lib/api";
import { toPatientQueue } from "@/lib/patient-queue";
import type { DailyBooking } from "@/types/bookings";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return Response.json(
      { message: "Staff sign-in required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const bookings = await apiFetch<DailyBooking[]>("/api/staff/bookings", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!Array.isArray(bookings)) {
      throw new Error("Invalid queue response.");
    }
    return Response.json(toPatientQueue(bookings), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const status =
      error instanceof ApiError && (error.status === 401 || error.status === 403)
        ? error.status
        : 502;
    console.error("Patient queue could not be loaded.", status);
    return Response.json(
      {
        message:
          status === 401 || status === 403
            ? "Staff sign-in required."
            : "Unable to load the patient queue.",
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
