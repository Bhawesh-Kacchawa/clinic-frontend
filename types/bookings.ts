import type { SessionName } from "@/types/sessions";

export interface CreateBookingRequest {
  clinicSlug: string;
  patientName: string;
  phone: string;
  session: SessionName;
}

export interface CreateBookingResponse {
  bookingId: string;
}

export interface BookingDetails {
  tokenNumber: string | number;
  patientName: string;
  session: SessionName;
  patientsAhead: number;
}

export type BookingStatus =
  | "WAITING"
  | "SERVING"
  | "SKIPPED"
  | "DONE"
  | "CANCELLED";

export interface BookingStatusResponse {
  status: BookingStatus;
  nowServing: string | number | null;
  patientsAhead: number;
  estimatedTimeMinutes: number | null;
}
