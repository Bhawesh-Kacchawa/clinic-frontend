import type { DailyBooking } from "@/types/bookings";

export interface PatientQueueEntry {
  patientName: string;
  token: string | number | null;
  phone: string;
  session: string;
  status: string;
}

export function maskPhone(phone?: string): string {
  let digits = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
  if (!digits) return "—";
  if (/^91[6-9]\d{9}$/.test(digits)) digits = digits.slice(2);
  if (digits.length <= 8) return "****";
  return `${digits.slice(0, 2)}${"*".repeat(digits.length - 6)}${digits.slice(-4)}`;
}

export function toPatientQueue(bookings: DailyBooking[]): PatientQueueEntry[] {
  return bookings.map((booking) => {
    const session =
      booking.sessionType ??
      (typeof booking.session === "string"
        ? booking.session
        : booking.session?.type);

    return {
      patientName: booking.patientName,
      token: booking.tokenNo ?? booking.tokenNumber ?? null,
      phone: maskPhone(booking.phone),
      session: session?.toUpperCase() ?? "OTHER",
      status: (booking.status ?? "WAITING")
        .toUpperCase()
        .replace(/[\s-]+/g, "_"),
    };
  });
}
