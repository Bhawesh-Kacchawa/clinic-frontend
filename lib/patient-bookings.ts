export function clinicToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);
}

export function formatClinicDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

export function formatPatientAddress(address: string): string {
  return address.replace(/([^\r\n]{20})(?=[^\r\n])/gu, "$1\n");
}

export function truncatePatientAddress(address: string): string {
  const characters = Array.from(address);
  return characters.length > 15 ? `${characters.slice(0, 15).join("")}...` : address;
}

export function isBookingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export interface TokenAppointment {
  patientName: string;
  sessionName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function tokenStorageKey(bookingId: string): string {
  return `booking-token:${bookingId}`;
}

export function isTokenAppointment(value: unknown): value is TokenAppointment {
  if (typeof value !== "object" || value === null) return false;
  const appointment = value as Record<string, unknown>;
  const isTime = (time: unknown) =>
    typeof time === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time);

  return (
    typeof appointment.patientName === "string" &&
    appointment.patientName.trim().length > 0 &&
    typeof appointment.sessionName === "string" &&
    appointment.sessionName.trim().length > 0 &&
    typeof appointment.date === "string" &&
    isBookingDate(appointment.date) &&
    isTime(appointment.startTime) &&
    isTime(appointment.endTime)
  );
}

export function tokenText(
  bookingId: string,
  token: string | number,
  appointment: TokenAppointment,
): string {
  return [
    "Appointment token",
    `Token number: ${token}`,
    `Patient: ${appointment.patientName}`,
    `Date: ${formatClinicDate(appointment.date)}`,
    `Session: ${appointment.sessionName}`,
    `Time: ${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`,
    `Booking reference: ${bookingId}`,
  ].join("\n");
}
