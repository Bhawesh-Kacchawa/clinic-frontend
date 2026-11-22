"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PatientQueueEntry } from "@/lib/patient-queue";

function compareTokens(a: PatientQueueEntry, b: PatientQueueEntry): number {
  return String(a.token ?? "").localeCompare(String(b.token ?? ""), undefined, {
    numeric: true,
  });
}

export function PatientQueue({ followServing = false }: { followServing?: boolean }) {
  const [bookings, setBookings] = useState<PatientQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queueContainers = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    async function refresh() {
      try {
        const response = await fetch("/api/patient-display/queue", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            response.status === 401 || response.status === 403
              ? "Staff sign-in is required to keep this display updated."
              : "Unable to refresh the queue.",
          );
        }
        const data: PatientQueueEntry[] = await response.json();
        if (active) {
          setBookings(data);
          setError(null);
        }
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : "Unable to refresh the queue.");
        }
      } finally {
        if (active) {
          setLoading(false);
          timer = setTimeout(refresh, 10_000);
        }
      }
    }

    void refresh();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  const groups = useMemo(() => {
    const sessions = ["MORNING", "EVENING"];
    if (bookings.some((booking) => !sessions.includes(booking.session))) {
      sessions.push("OTHER");
    }
    return sessions.map((session) => ({
      session,
      bookings: bookings
        .filter((booking) =>
          session === "OTHER"
            ? !["MORNING", "EVENING"].includes(booking.session)
            : booking.session === session,
        )
        .sort(compareTokens),
    }));
  }, [bookings]);

  useEffect(() => {
    if (!followServing || loading) return;

    for (const container of queueContainers.current.values()) {
      const row = container.querySelector<HTMLTableRowElement>('tr[data-serving="true"]');
      if (!row) continue;

      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const headerHeight = container.querySelector("thead")?.getBoundingClientRect().height ?? 0;
      if (rowRect.top < containerRect.top + headerHeight || rowRect.bottom > containerRect.bottom) {
        container.scrollTop += rowRect.top - containerRect.top - headerHeight;
      }
    }
  }, [followServing, groups, loading]);

  return (
    <div className="mt-8">
      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error} Displayed information may be out of date. Retrying automatically.
        </p>
      )}
      {loading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading queue…
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map(({ session, bookings: sessionBookings }) => {
            const serving = sessionBookings.find((booking) => booking.status === "SERVING");
            return (
              <section key={session} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-900 p-6 text-white">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-200">
                    {session === "OTHER" ? "Other session" : `${session} session`}
                  </h2>
                  <p className="mt-4 text-sm text-slate-300">Now serving</p>
                  <div aria-live="polite">
                    <p className="mt-1 text-4xl font-bold">
                      {serving?.token != null ? `#${serving.token}` : "—"}
                    </p>
                    <p className="mt-2 text-lg text-slate-200">
                      {serving ? serving.patientName : "No patient is being called right now."}
                    </p>
                  </div>
                </div>
                <div
                  ref={(element) => {
                    if (element) queueContainers.current.set(session, element);
                    else queueContainers.current.delete(session);
                  }}
                  className={followServing ? "max-h-[max(12rem,calc(100vh-28rem))] overflow-auto" : "overflow-x-auto"}
                >
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead className={`${followServing ? "sticky top-0" : ""} bg-slate-50 text-slate-600`}>
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">Token</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Patient</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessionBookings.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-5 text-slate-500">No patients in this session.</td></tr>
                      ) : sessionBookings.map((booking, index) => (
                        <tr
                          key={index}
                          data-serving={booking.status === "SERVING" || undefined}
                          className={booking.status === "SERVING" ? "bg-emerald-50" : undefined}
                        >
                          <td className={`px-4 py-4 font-bold ${booking.status === "SERVING" ? "text-emerald-800" : "text-slate-900"}`}>
                            {booking.token != null ? `#${booking.token}` : "—"}
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-900">{booking.patientName}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-600">{booking.phone}</td>
                          <td className="px-4 py-4 text-slate-600">
                            {booking.status === "SERVING" ? (
                              <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
                                Now serving
                              </span>
                            ) : booking.status.replace(/_/g, " ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-right text-xs text-slate-500">
        This view refreshes automatically every 10 seconds.
      </p>
    </div>
  );
}
