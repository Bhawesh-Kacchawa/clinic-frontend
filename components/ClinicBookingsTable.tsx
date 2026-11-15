"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { DailyBooking } from "@/types/bookings";

export function ClinicBookingsTable({
  slug,
  initialBookings,
}: {
  slug: string;
  initialBookings: DailyBooking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deleteBooking(bookingId: string) {
    if (!window.confirm("Permanently delete this booking?")) return;

    setDeletingBookingId(bookingId);
    setDeleteError(null);
    try {
      await apiFetch<void>(
        `/api/clinics/${encodeURIComponent(slug)}/bookings/${encodeURIComponent(bookingId)}`,
        { method: "DELETE" },
      );
      setBookings((current) =>
        current.filter((booking) => booking.bookingId !== bookingId),
      );
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete booking.",
      );
    } finally {
      setDeletingBookingId(null);
    }
  }

  console.log(bookings);


  return (
    <>
      {deleteError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
        >
          Booking could not be deleted: {deleteError}
        </p>
      )}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm text-slate-600">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Token</th>
              <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
              <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
              <th scope="col" className="px-5 py-3 font-semibold">Session</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 font-semibold">Reason</th>
              <th scope="col" className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-4 text-slate-600">
                  There are no bookings for today.
                </td>
              </tr>
            ) : (
              bookings.map((booking, index) => (
                <tr key={booking.bookingId ?? `${booking.patientName}-${index}`}>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {booking.tokenNo ?? booking.tokenNumber ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-900">{booking.patientName}</td>
                  <td className="px-5 py-4 text-slate-600">{booking.phone ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {typeof booking.sessionType === "string"
                      ? booking.sessionType
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{booking.status ?? "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{booking.reason ?? "—"}</td>
                  <td className="px-5 py-4">
                    {booking.bookingId ? (
                      <button
                        type="button"
                        onClick={() =>
                          booking.bookingId && deleteBooking(booking.bookingId)
                        }
                        disabled={deletingBookingId === booking.bookingId}
                        className="rounded-lg border border-rose-300 px-3 py-2 font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingBookingId === booking.bookingId
                          ? "Deleting…"
                          : "Delete"}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
