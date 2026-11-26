import type { ClinicSessionsResponse } from "@/types/bookings";
import type { SessionAvailability, SessionName } from "@/types/sessions";

export function toSessionAvailability(
  response: ClinicSessionsResponse,
): SessionAvailability[] {
  return response.sessions.flatMap((session) => {
    const name: SessionName | null =
      session.type.toUpperCase() === "MORNING"
        ? "Morning"
        : session.type.toUpperCase() === "EVENING"
          ? "Evening"
          : null;
    if (!name) return [];

    const slotsLeft = Math.max(
      0,
      session.maxAppointments - session.bookedCount,
    );
    const opensAt = session.bookingOpensAt
      ? Date.parse(session.bookingOpensAt)
      : Number.NaN;
    const serverTime = Date.parse(response.serverTime);
    const bookingStatus = session.bookingStatus.toUpperCase();
    const status =
      bookingStatus === "CLOSED"
          ? "closed"
          : bookingStatus === "PAUSED"
            ? "paused"
            : slotsLeft === 0
              ? "full"
              : Number.isFinite(opensAt) &&
                  Number.isFinite(serverTime) &&
                  opensAt > serverTime
                ? "opens-soon"
                : "open";

    return [{
      sessionId: session.type.toUpperCase(),
      name,
      timing: `${session.startTime.slice(0, 5)}–${session.endTime.slice(0, 5)}`,
      slotsLeft,
      bookedCount: session.bookedCount,
      maxAppointments: session.maxAppointments,
      status,
      bookingOpensAt: session.bookingOpensAt,
      serverTime: response.serverTime,
    }];
  });
}
