import Link from "next/link";
import { AppointmentToken } from "@/components/AppointmentToken";
import { apiFetch } from "@/lib/api";
import type { BookingDetails } from "@/types/bookings";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  let booking: BookingDetails | null = null;
  let loadError: string | null = null;

  try {
    booking = await apiFetch<BookingDetails>(
      `/api/public/bookings/${encodeURIComponent(bookingId)}`,
      { cache: "no-store" },
    );
  } catch {
    loadError = "We couldn't find this booking. Check the link or try again later.";
  }
  const tokenNumber = booking?.token ?? booking?.tokenNo ?? booking?.tokenNumber;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        {loadError || !booking ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
              Booking unavailable
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              We couldn&apos;t load your booking
            </h1>
            <p role="alert" className="mt-3 leading-6 text-slate-600">
              {loadError ?? "Please try again later."}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Booking confirmed
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Your token number
            </h1>
            <p
              aria-label={
                tokenNumber == null
                  ? "Token number unavailable"
                  : `Token number ${tokenNumber}`
              }
              className="mt-4 text-6xl font-bold tracking-tight text-cyan-800 sm:text-7xl"
            >
              {tokenNumber ?? "—"}
            </p>

            <AppointmentToken bookingId={bookingId} token={tokenNumber} />

            {(booking.patientName ||
              booking.session ||
              booking.status ||
              booking.nowServing != null ||
              booking.patientsAhead != null ||
              booking.estimatedTimeMinutes != null) && (
              <dl className="mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200 text-left">
                {booking.patientName && (
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <dt className="text-slate-500">Patient</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {booking.patientName}
                    </dd>
                  </div>
                )}
                {booking.session && (
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <dt className="text-slate-500">Session</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {booking.session}
                    </dd>
                  </div>
                )}
                {booking.status && (
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {booking.status}
                    </dd>
                  </div>
                )}
                {booking.nowServing != null && (
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <dt className="text-slate-500">Now serving</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {booking.nowServing}
                    </dd>
                  </div>
                )}
                {booking.patientsAhead != null && (
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <dt className="text-slate-500">Patients ahead</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {booking.patientsAhead}
                    </dd>
                  </div>
                )}
                {booking.estimatedTimeMinutes != null && (
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <dt className="text-slate-500">Estimated wait</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {booking.estimatedTimeMinutes} min
                    </dd>
                  </div>
                )}
              </dl>
            )}
            <p className="mt-6 text-sm leading-6 text-slate-500">
              Keep your token number handy for your visit.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
