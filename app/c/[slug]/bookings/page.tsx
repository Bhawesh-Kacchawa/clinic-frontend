import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { DailyBooking } from "@/types/bookings";

export default async function ClinicBookingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let bookings: DailyBooking[] = [];
  let loadError: string | null = null;

  try {
    bookings = await apiFetch<DailyBooking[]>(
      `/api/clinics/${encodeURIComponent(slug)}/bookings`,
      { cache: "no-store" },
    );
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load today's bookings.";
  }

  return (
    <main className="min-h-screen px-6 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic bookings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Today&apos;s bookings
        </h1>
        <p className="mt-3 text-slate-600">{slug}</p>

        {loadError ? (
          <p
            role="alert"
            className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          >
            Bookings could not be loaded: {loadError}
          </p>
        ) : bookings.length === 0 ? (
          <p className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            There are no bookings for today.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Token</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Session</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {bookings.map((booking, index) => (
                  <tr key={booking.bookingId ?? `${booking.patientName}-${index}`}>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {booking.tokenNo ?? booking.tokenNumber ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-900">{booking.patientName}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.phone ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {booking.session?.type ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{booking.status ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link
          href={`/c/${encodeURIComponent(slug)}`}
          className="mt-8 inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          Back to sessions
        </Link>
      </section>
    </main>
  );
}
