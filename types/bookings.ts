import type { SessionName } from "@/types/sessions";

export interface CreateBookingRequest {
  sessionId: string;
  patientName: string;
  phone: string;
  reason?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
}

export interface BookingDetails {
  tokenNumber: string | number;
  patientName?: string;
  session?: SessionName | string;
  status?: BookingStatus;
  nowServing?: string | number | null;
  patientsAhead?: number;
  estimatedTimeMinutes?: number | null;
}

export interface DailyBooking {
  bookingId?: string;
  tokenNo?: string | number;
  tokenNumber?: string | number;
  patientName: string;
  phone?: string;
  sessionType?: string;
  session?:
    | string
    | {
        sessionId: string;
        type: string;
        date: string;
        startTime: string;
        endTime: string;
      };
  reason?: string;
  status?: string;
}

export interface ClinicSessionsResponse {
  serverTime: string;
  sessions: Array<{
    type: string;
    startTime: string;
    endTime: string;
    maxAppointments: number;
    bookedCount: number;
    bookingStatus: string;
    bookingOpensAt?: string;
  }>;
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
