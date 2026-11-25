"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const clinicSlug = "demo-dental";

export function PatientBookingCallAction({
  bookingId,
  token,
}: {
  bookingId?: string;
  token: string | number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callPatient() {
    if (!bookingId) {
      setError("This booking has no ID and cannot be called.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await apiFetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/bookings/${encodeURIComponent(bookingId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SERVING" }),
        },
      );
      setMessage(`Token ${token} is now serving.`);
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to call this patient.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy || !bookingId}
        onClick={() => void callPatient()}
        className="rounded-lg border border-cyan-300 px-3 py-2 font-semibold text-cyan-800 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Calling…" : "Call this number"}
      </button>
      {message ? (
        <p role="status" className="mt-2 text-xs text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
