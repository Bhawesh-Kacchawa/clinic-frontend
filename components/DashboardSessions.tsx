"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ClinicSessionsResponse } from "@/types/bookings";
import type { SessionName } from "@/types/sessions";

const clinicSlug = "demo-dental";
const sessionOrder: SessionName[] = ["Morning", "Evening"];

type SessionForm = {
  startTime: string;
  endTime: string;
  maxAppointments: string;
  bookingOpensAt: string;
};

type ManagedSession = SessionForm & {
  id: string;
  type: SessionName;
  bookingStatus: string;
  bookedCount: number;
};

const emptyForm: SessionForm = {
  startTime: "",
  endTime: "",
  maxAppointments: "",
  bookingOpensAt: "",
};

function sessionName(type: string): SessionName | null {
  const normalized = type.toUpperCase();
  if (normalized === "MORNING") return "Morning";
  if (normalized === "EVENING") return "Evening";
  return null;
}

function toLocalDateTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toPayload(form: SessionForm) {
  const payload: {
    startTime: string;
    endTime: string;
    maxAppointments: number;
    bookingOpensAt?: string;
  } = {
    startTime: form.startTime,
    endTime: form.endTime,
    maxAppointments: Number(form.maxAppointments),
  };
  if (form.bookingOpensAt) {
    payload.bookingOpensAt = new Date(form.bookingOpensAt).toISOString();
  }
  return payload;
}

export function DashboardSessions() {
  const [sessions, setSessions] = useState<ManagedSession[]>([]);
  const [forms, setForms] = useState<Record<SessionName, SessionForm>>({
    Morning: emptyForm,
    Evening: emptyForm,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SessionName | null>(null);
  const [changingStatus, setChangingStatus] = useState<SessionName | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadSessions() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<ClinicSessionsResponse>(
        `/api/public/clinics/${encodeURIComponent(clinicSlug)}/sessions`,
        { cache: "no-store" },
      );
      const managedSessions = response.sessions.flatMap((session) => {
          const type = sessionName(session.type);
          if (!type) return [];
          return [{
            id: session.id,
            type,
            startTime: session.startTime.slice(0, 5),
            endTime: session.endTime.slice(0, 5),
            maxAppointments: String(session.maxAppointments),
            bookingOpensAt: toLocalDateTime(session.bookingOpensAt),
            bookingStatus: session.bookingStatus.toUpperCase(),
            bookedCount: session.bookedCount,
          }];
        });
      setSessions(managedSessions);
      setForms({
        Morning:
          managedSessions.find((session) => session.type === "Morning") ??
          emptyForm,
        Evening:
          managedSessions.find((session) => session.type === "Evening") ??
          emptyForm,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load sessions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  function getForm(sessionName: SessionName): SessionForm {
    return forms[sessionName];
  }

  function updateForm(name: SessionName, form: SessionForm) {
    setForms((current) => ({ ...current, [name]: form }));
  }

  async function saveSession(name: SessionName) {
    const session = sessions.find((item) => item.type === name);
    const form = forms[name];

    const maxAppointments = Number(form.maxAppointments);
    if (
      !form.startTime ||
      !form.endTime ||
      !Number.isInteger(maxAppointments) ||
      maxAppointments < 1
    ) {
      setError("Enter valid session times and a positive appointment limit.");
      return;
    }

    setSaving(name);
    setError(null);
    setNotice(null);
    try {
      const isExisting = session !== undefined;
      const path = `/api/clinics/${encodeURIComponent(clinicSlug)}/sessions`;
      await apiFetch(
        isExisting
          ? `${path}/${name.toUpperCase()}`
          : path,
        {
          method: isExisting ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: name.toUpperCase(),
            ...(session ? { id: session.id } : {}),
            ...toPayload(form),
          }),
        },
      );
      setNotice(`${name} session saved.`);
      await loadSessions();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Unable to save the ${name.toLowerCase()} session.`,
      );
    } finally {
      setSaving(null);
    }
  }

  async function setStatus(
    name: SessionName,
    bookingStatus: "OPEN" | "PAUSED" | "CLOSED",
  ) {
    setChangingStatus(name);
    setError(null);
    setNotice(null);
    try {
      await apiFetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/sessions/${name.toUpperCase()}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingStatus,
            id: sessions.find((item) => item.type === name)?.id,
          }),
        },
      );
      setNotice(`${name} bookings ${bookingStatus.toLowerCase()}.`);
      await loadSessions();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : `Unable to update ${name.toLowerCase()} booking status.`,
      );
    } finally {
      setChangingStatus(null);
    }
  }

  return (
    <div className="mt-2 mx-2">
      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        >
          {notice}
        </p>
      ) : null}

      {loading ? (
        <p role="status" className="text-slate-600">
          Loading sessions…
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sessionOrder.map((name) => {
            const session = sessions.find((item) => item.type === name);
            const form = getForm(name);
            const isExisting = session !== undefined;

            return (
              <article
                key={name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {isExisting
                        ? `Current status: ${session.bookingStatus.toLowerCase()}`
                        : "Not configured yet"}
                    </p>
                  </div>
                  {isExisting ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {session.bookedCount} booked
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    Starts
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(event) =>
                        updateForm(name, {
                          ...form,
                          startTime: event.target.value,
                        })
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Ends
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(event) =>
                        updateForm(name, {
                          ...form,
                          endTime: event.target.value,
                        })
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Appointment limit
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.maxAppointments}
                      onChange={(event) =>
                        updateForm(name, {
                          ...form,
                          maxAppointments: event.target.value,
                        })
                      }
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Booking opens at
                    <input
                      type="datetime-local"
                      value={form.bookingOpensAt}
                      onChange={(event) =>
                        updateForm(name, {
                          ...form,
                          bookingOpensAt: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => void saveSession(name)}
                  disabled={saving !== null || changingStatus !== null}
                  className="mt-5 w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving === name
                    ? "Saving…"
                    : isExisting
                      ? "Save changes"
                      : "Create session"}
                </button>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {([
                    ["OPEN", "Open"],
                    ["PAUSED", "Pause"],
                    ["CLOSED", "Close"],
                  ] as const).map(([status, label]) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void setStatus(name, status)}
                      disabled={
                        !isExisting ||
                        changingStatus !== null ||
                        saving !== null ||
                        session.bookingStatus === status
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {changingStatus === name ? "Updating…" : label}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
