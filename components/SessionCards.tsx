"use client";

import { useCallback, useRef, useState } from "react";
import { BookingFormModal } from "@/components/BookingFormModal";
import { BookingCountdown } from "@/components/BookingCountdown";
import { apiFetch } from "@/lib/api";
import { toSessionAvailability } from "@/lib/sessions";
import type { ClinicSessionsResponse } from "@/types/bookings";
import type {
  SessionAvailability,
  SessionName,
  SessionStatus,
} from "@/types/sessions";

const sessionOrder: SessionName[] = ["Morning", "Evening"];

const statusLabels: Record<SessionStatus, string> = {
  "opens-soon": "Opens soon",
  open: "Open",
  paused: "Paused",
  full: "Full",
  closed: "Closed",
};

const statusStyles: Record<SessionStatus, string> = {
  "opens-soon": "bg-amber-100 text-amber-800",
  open: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  full: "bg-slate-100 text-slate-700",
  closed: "bg-rose-100 text-rose-800",
};

export function SessionCards({
  slug,
  appointmentDate,
  initialSessions,
}: {
  slug: string;
  appointmentDate: string;
  initialSessions: SessionAvailability[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [bookingSession, setBookingSession] =
    useState<SessionAvailability | null>(null);
  const refreshInProgress = useRef(false);

  const refreshSessions = useCallback(async () => {
    if (refreshInProgress.current) {
      return;
    }

    refreshInProgress.current = true;
    try {
      const response = await apiFetch<ClinicSessionsResponse>(
        `/api/public/clinics/${encodeURIComponent(slug)}/sessions`,
        { cache: "no-store" },
      );
      setSessions(toSessionAvailability(response));
      setRefreshError(null);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "Unable to refresh sessions.",
      );
    } finally {
      refreshInProgress.current = false;
    }
  }, [slug]);

  const sessionsByName = new Map(sessions.map((session) => [session.name, session]));

  return (
    <>
      {refreshError && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          Sessions could not be refreshed: {refreshError}
        </p>
      )}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {sessionOrder.map((name) => {
          const session = sessionsByName.get(name);

          return (
            <article
              key={name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
                {session && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[session.status]}`}
                  >
                    {statusLabels[session.status]}
                  </span>
                )}
              </div>
              {session ? (
                <>
                  <p className="mt-4 text-slate-600">{session.timing}</p>
                  {session.maxAppointments > 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-slate-600">
                        {session.bookedCount} of {session.maxAppointments} appointments booked
                      </p>
                      <div
                        role="progressbar"
                        aria-label={`${name} session appointments booked`}
                        aria-valuemin={0}
                        aria-valuemax={session.maxAppointments}
                        aria-valuenow={Math.min(
                          session.maxAppointments,
                          Math.max(0, session.bookedCount),
                        )}
                        aria-valuetext={`${session.bookedCount} of ${session.maxAppointments} appointments booked`}
                        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
                      >
                        <div
                          className="h-full rounded-full bg-cyan-700 transition-[width]"
                          style={{
                            width: `${Math.min(100, Math.max(0, (session.bookedCount / session.maxAppointments) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="mt-4 text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">
                      {session.slotsLeft}
                    </span>{" "}
                    {session.slotsLeft === 1 ? "slot" : "slots"} left
                  </p>
                  {session.status === "open" && session.slotsLeft > 0 && (
                    <button
                      type="button"
                      onClick={() => setBookingSession(session)}
                      className="mt-5 w-full rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                    >
                      Book this session
                    </button>
                  )}
                  {session.status === "opens-soon" &&
                    session.bookingOpensAt &&
                    session.serverTime && (
                    <BookingCountdown
                      bookingOpensAt={session.bookingOpensAt}
                      serverTime={session.serverTime}
                      onComplete={refreshSessions}
                    />
                    )}
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No session data available.
                </p>
              )}
            </article>
          );
        })}
      </div>
      {bookingSession && (
        <BookingFormModal
          sessionId={bookingSession.sessionId}
          sessionName={bookingSession.name}
          appointmentDate={appointmentDate}
          open
          onClose={() => setBookingSession(null)}
        />
      )}
    </>
  );
}
