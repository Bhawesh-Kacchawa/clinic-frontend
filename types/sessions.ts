export type SessionName = "Morning" | "Evening";

export type SessionStatus = "opens-soon" | "open" | "full" | "closed";

export interface SessionAvailability {
  name: SessionName;
  timing: string;
  slotsLeft: number;
  status: SessionStatus;
}
