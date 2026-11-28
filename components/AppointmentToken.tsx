"use client";

import { useEffect, useState } from "react";
import {
  isTokenAppointment,
  formatClinicDate,
  tokenStorageKey,
  tokenText,
  type TokenAppointment,
} from "@/lib/patient-bookings";

export function AppointmentToken({
  bookingId,
  token,
}: {
  bookingId: string;
  token: string | number | undefined;
}) {
  const [appointment, setAppointment] = useState<TokenAppointment | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(tokenStorageKey(bookingId));
      const details: unknown = saved ? JSON.parse(saved) : null;
      setAppointment(isTokenAppointment(details) ? details : null);
    } catch {
      console.error("Could not read appointment details on this device.");
      setAppointment(null);
    }
    setLoaded(true);
  }, [bookingId]);

  function downloadToken() {
    if (!appointment || token == null) return;
    const file = new Blob([tokenText(bookingId, token, appointment)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointment-token-${bookingId}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!loaded) {
    return <p className="mt-6 text-sm text-slate-500">Loading appointment details...</p>;
  }

  if (!appointment) {
    return (
      <p role="status" className="mt-6 text-sm text-amber-800">
        Appointment details are unavailable on this device. Please contact the clinic
        for your appointment date and time.
      </p>
    );
  }

  return (
    <>
      <dl className="mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200 text-left text-sm sm:text-base">
        <div className="flex justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <dt className="text-slate-500">Patient</dt>
          <dd className="min-w-0 break-words text-right font-medium text-slate-900">{appointment.patientName}</dd>
        </div>
        <div className="flex justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <dt className="text-slate-500">Appointment date</dt>
          <dd className="min-w-0 break-words text-right font-medium text-slate-900">
            <time dateTime={appointment.date}>{formatClinicDate(appointment.date)}</time>
          </dd>
        </div>
        <div className="flex justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <dt className="text-slate-500">Session</dt>
          <dd className="min-w-0 break-words text-right font-medium text-slate-900">
            {appointment.sessionName} ({appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)})
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-slate-500">
        Appointment details are saved on this device. Contact the clinic to confirm
        any changes.
      </p>
      {token != null ? (
        <button
          type="button"
          onClick={downloadToken}
          className="mt-6 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          Download token
        </button>
      ) : (
        <p role="status" className="mt-6 text-sm text-amber-800">
          The token number is unavailable. Please contact the clinic.
        </p>
      )}
    </>
  );
}
