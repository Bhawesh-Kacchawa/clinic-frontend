"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { BookingStatus, BookingStatusResponse } from "@/types/bookings";

const terminalMessages: Partial<Record<BookingStatus, string>> = {
  SKIPPED:
    "Your token was skipped. Please contact the clinic team for assistance.",
  DONE: "Your visit is complete. Thank you for visiting!",
  CANCELLED: "This booking was cancelled. Please contact the clinic if you need help.",
};

export function BookingLiveStatus({
  bookingId,
  initialPatientsAhead,
}: {
  bookingId: string;
  initialPatientsAhead: number;
}) {
  const [status, setStatus] = useState<BookingStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;
    const controller = new AbortController();

    const poll = async () => {
      try {
        const result = await apiFetch<BookingStatusResponse>(
          `/api/public/bookings/${encodeURIComponent(bookingId)}/status`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!active) return;

        setStatus(result);
        setError(null);
        if (terminalMessages[result.status]) return;
      } catch {
        if (!active) return;
        setError("Live status is temporarily unavailable. We'll try again shortly.");
      }

      if (active) {
        timeoutId = window.setTimeout(poll, 15_000);
      }
    };

    void poll();

    return () => {
      active = false;
      controller.abort();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [bookingId]);

  const terminalMessage = status ? terminalMessages[status.status] : null;

  return (
    <section
      aria-live="polite"
      className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Live queue status
      </h2>
      {terminalMessage ? (
        <p className="mt-3 leading-6 text-slate-800">{terminalMessage}</p>
      ) : (
        <>
          {error && (
            <p role="status" className="mt-3 text-sm text-amber-800">
              {error}
            </p>
          )}
          <dl className="mt-3 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Now serving</dt>
              <dd className="font-semibold text-slate-900">
                {status?.nowServing ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Patients ahead</dt>
              <dd className="font-semibold text-slate-900">
                {status?.patientsAhead ?? initialPatientsAhead}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Estimated time</dt>
              <dd className="font-semibold text-slate-900">
                {status?.estimatedTimeMinutes == null
                  ? "Calculating..."
                  : `${status.estimatedTimeMinutes} min`}
              </dd>
            </div>
          </dl>
          {status && (
            <p className="mt-4 text-xs text-slate-500">
              Status: {status.status.toLowerCase()}
            </p>
          )}
        </>
      )}
    </section>
  );
}
