"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CreateBookingResponse, DailyBooking } from "@/types/bookings";
import type { SessionName } from "@/types/sessions";

const clinicSlug = "demo-dental";
const sessionNames: SessionName[] = ["Morning", "Evening"];

const statusStyles: Record<string, string> = {
  WAITING: "bg-sky-100 text-sky-800",
  SERVING: "bg-emerald-100 text-emerald-800",
  SKIPPED: "bg-amber-100 text-amber-900",
  DONE: "bg-slate-100 text-slate-700",
  NO_SHOW: "bg-rose-100 text-rose-800",
  NOSHOW: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};

function getSessionName(booking: DailyBooking): SessionName | null {
  const value =
    booking.sessionType ??
    (typeof booking.session === "string"
      ? booking.session
      : booking.session?.type);
  const normalized = value?.toUpperCase();
  if (normalized === "MORNING") return "Morning";
  if (normalized === "EVENING") return "Evening";
  return null;
}

function getToken(booking: DailyBooking): string | number {
  return booking.tokenNo ?? booking.tokenNumber ?? "—";
}

function compareQueue(a: DailyBooking, b: DailyBooking): number {
  const aToken = Number(getToken(a));
  const bToken = Number(getToken(b));
  if (Number.isFinite(aToken) && Number.isFinite(bToken)) {
    return aToken - bToken;
  }
  return String(getToken(a)).localeCompare(String(getToken(b)), undefined, {
    numeric: true,
  });
}

function statusKey(status?: string): string {
  return (status ?? "WAITING").toUpperCase().replace(/[\s-]+/g, "_");
}

export function DashboardQueue() {
  const [selectedSession, setSelectedSession] = useState<SessionName>("Morning");
  const [bookings, setBookings] = useState<DailyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const refreshInProgress = useRef(false);

  const refresh = useCallback(async (showLoading = false) => {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    if (showLoading) setLoading(true);
    try {
      const result = await apiFetch<DailyBooking[]>(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/bookings`,
        { cache: "no-store" },
      );
      setBookings(result);
      setRefreshError(null);
    } catch (error) {
      setRefreshError(
        error instanceof Error ? error.message : "Unable to refresh the queue.",
      );
    } finally {
      if (showLoading) setLoading(false);
      refreshInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh(true);
    const timer = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const sessionBookings = useMemo(
    () =>
      bookings
        .filter((booking) => getSessionName(booking) === selectedSession)
        .sort(compareQueue),
    [bookings, selectedSession],
  );
  const nowServing = sessionBookings.find(
    (booking) => statusKey(booking.status) === "SERVING",
  );
  async function runAction(actionKey: string, operation: () => Promise<void>) {
    setBusyAction(actionKey);
    setActionError(null);
    setNotice(null);
    try {
      await operation();
      await refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "The queue action failed.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function updateBookingStatus(
    booking: DailyBooking,
    status: "SERVING" | "SKIPPED" | "WAITING" | "NO_SHOW",
  ) {
    if (!booking.bookingId) {
      throw new Error("This booking has no ID and cannot be updated.");
    }
    await apiFetch(
      `/api/clinics/${encodeURIComponent(clinicSlug)}/bookings/${encodeURIComponent(booking.bookingId)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    setNotice(
      status === "SERVING"
        ? `Now calling token ${getToken(booking)}.`
        : status === "WAITING"
          ? `Token ${getToken(booking)} is back in the queue.`
          : status === "SKIPPED"
            ? `Token ${getToken(booking)} was marked not here.`
            : `Token ${getToken(booking)} was marked no-show.`,
    );
  }

  function callNext() {
    void runAction("call-next", async () => {
      await apiFetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/sessions/${selectedSession.toUpperCase()}/call-next`,
        { method: "POST" },
      );
      setNotice("Called the next patient.");
    });
  }

  function undo() {
    void runAction("undo", async () => {
      await apiFetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/sessions/${selectedSession.toUpperCase()}/undo`,
        { method: "POST" },
      );
      setNotice("Last queue action undone.");
    });
  }

  async function addWalkIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await runAction("walk-in", async () => {
      await apiFetch<CreateBookingResponse>("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.toUpperCase(),
          patientName: String(formData.get("patientName") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          reason: String(formData.get("reason") ?? "").trim() || undefined,
        }),
      });
      setWalkInOpen(false);
      setNotice("Walk-in added to the queue.");
    });
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <label className="max-w-xs text-sm font-semibold text-slate-700">
          Session
          <select
            value={selectedSession}
            onChange={(event) =>
              setSelectedSession(event.target.value as SessionName)
            }
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          >
            {sessionNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={callNext}
            disabled={busyAction !== null}
            className="rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === "call-next" ? "Calling…" : "Call next"}
          </button>
          <button
            type="button"
            onClick={() => setWalkInOpen((open) => !open)}
            disabled={busyAction !== null}
            className="rounded-xl border border-cyan-700 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-50"
          >
            Add walk-in
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={busyAction !== null}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busyAction === "undo" ? "Undoing…" : "Undo"}
          </button>
        </div>
      </div>

      <section
        aria-live="polite"
        className="mt-5 flex flex-col gap-2 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-200">
            Now serving · {selectedSession}
          </p>
          <p className="mt-2 text-3xl font-bold">
            {nowServing ? `#${getToken(nowServing)}` : "—"}
          </p>
        </div>
        {nowServing ? (
          <p className="text-lg text-slate-200">{nowServing.patientName}</p>
        ) : (
          <p className="text-slate-300">No patient is being called right now.</p>
        )}
      </section>

      {refreshError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
        >
          Queue refresh failed: {refreshError}
        </p>
      ) : null}
      {actionError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
        >
          {actionError}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        >
          {notice}
        </p>
      ) : null}

      {walkInOpen ? (
        <form
          onSubmit={addWalkIn}
          className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3"
        >
          <label className="text-sm font-medium text-slate-700">
            Patient name
            <input
              name="patientName"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone
            <input
              name="phone"
              type="tel"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Reason (optional)
            <input
              name="reason"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5"
            />
          </label>
          <div className="flex gap-2 sm:col-span-3">
            <button
              type="submit"
              disabled={busyAction !== null}
              className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
            >
              {busyAction === "walk-in" ? "Adding…" : "Add to queue"}
            </button>
            <button
              type="button"
              onClick={() => setWalkInOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Queue</th>
              <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
              <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-slate-600">
                  Loading queue…
                </td>
              </tr>
            ) : sessionBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-slate-600">
                  No patients in the {selectedSession.toLowerCase()} queue.
                </td>
              </tr>
            ) : (
              sessionBookings.map((booking, index) => {
                const status = statusKey(booking.status);
                const key =
                  booking.bookingId ?? `${getToken(booking)}-${booking.patientName}`;
                const busy = busyAction === key;
                const skipped = status === "SKIPPED";

                return (
                  <tr key={key}>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {index + 1}. #{getToken(booking)}
                    </td>
                    <td className="px-5 py-4 text-slate-900">
                      <span className="font-medium">{booking.patientName}</span>
                      {booking.reason ? (
                        <span className="mt-1 block text-xs text-slate-500">
                          {booking.reason}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{booking.phone ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyAction !== null || !booking.bookingId}
                          onClick={() =>
                            void runAction(key, () =>
                              apiFetch(
                                `/api/clinics/${encodeURIComponent(clinicSlug)}/bookings/${encodeURIComponent(booking.bookingId!)}/status`,
                                {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "SERVING" }),
                                },
                              ).then(() => {
                                setNotice(`Now calling token ${getToken(booking)}.`);
                              }),
                            )
                          }
                          className="rounded-lg border border-cyan-300 px-3 py-2 font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-50"
                        >
                          Call this number
                        </button>
                        <button
                          type="button"
                          disabled={busyAction !== null || !booking.bookingId}
                          onClick={() =>
                            void runAction(key, () =>
                              updateBookingStatus(booking, "SKIPPED"),
                            )
                          }
                          className="rounded-lg border border-amber-300 px-3 py-2 font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                        >
                          Skip (not here)
                        </button>
                        <button
                          type="button"
                          disabled={busyAction !== null || !booking.bookingId}
                          onClick={() =>
                            void runAction(key, () =>
                              updateBookingStatus(
                                booking,
                                skipped ? "WAITING" : "SERVING",
                              ),
                            )
                          }
                          className="rounded-lg border border-emerald-300 px-3 py-2 font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          Arrived / Re-queue
                        </button>
                        <button
                          type="button"
                          disabled={busyAction !== null || !booking.bookingId}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Mark token ${getToken(booking)} as no-show?`,
                              )
                            ) {
                              void runAction(key, () =>
                                updateBookingStatus(booking, "NO_SHOW"),
                              );
                            }
                          }}
                          className="rounded-lg border border-rose-300 px-3 py-2 font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                        >
                          No-show
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-right text-xs text-slate-500">
        Queue refreshes automatically every 10 seconds.
      </p>
    </div>
  );
}
