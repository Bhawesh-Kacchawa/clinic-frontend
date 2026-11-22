import Link from "next/link";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import { clinicToday, formatPatientAddress, isBookingDate } from "@/lib/patient-bookings";
import type { DailyBooking } from "@/types/bookings";

export const dynamic = "force-dynamic";

export default async function DashboardPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const { date: requestedDate } = await searchParams;
  const date = requestedDate === undefined ? clinicToday() : requestedDate;
  let bookings: DailyBooking[] = [];
  let loadError: string | null = null;

  if (typeof date !== "string" || !isBookingDate(date)) {
    loadError = "Please select a valid date.";
  } else {
    try {
      const result = await apiFetch<DailyBooking[]>(
        `/api/staff/bookings?date=${encodeURIComponent(date)}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${(await cookies()).get("access_token")?.value ?? ""}`,
          },
        },
      );
      if (!Array.isArray(result)) {
        throw new Error("The API returned an invalid bookings list.");
      }
      bookings = result;
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Unable to load patients.";
    }
  }

  return (
    <main className="px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        {/* <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p> */}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Patients
        </h1>
        <p className="mt-3 text-slate-600">
          View patient bookings for a selected date.
        </p>
        <form className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label htmlFor="date" className="text-sm font-semibold text-slate-700">
            Booking date
            <input
              key={typeof date === "string" ? date : "invalid"}
              id="date"
              name="date"
              type="date"
              required
              defaultValue={typeof date === "string" && isBookingDate(date) ? date : ""}
              className="mt-2 block rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <button type="submit" className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2">
            Show patients
          </button>
          <Link href="/dashboard" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Today
          </Link>
        </form>

        {loadError ? (
          <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            Patients could not be loaded: {loadError}
          </p>
        ) : (
          <section aria-label={`Patients for ${date}`}>
            <p className="mt-6 text-sm text-slate-600">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} for {date}
            </p>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[760px] divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Token</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Address</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Session</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-slate-600">
                        No patients booked for this date.
                      </td>
                    </tr>
                  ) : bookings.map((booking, index) => (
                    <tr key={booking.bookingId ?? `${booking.patientName}-${index}`}>
                      <td className="px-5 py-4 font-semibold text-slate-900">{booking.tokenNo ?? booking.tokenNumber ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-900">{booking.patientName}</td>
                      <td className="px-5 py-4 text-slate-600">{booking.phone ?? "—"}</td>
                      <td className="max-w-[18rem] whitespace-pre-wrap break-words px-5 py-4 text-slate-600">{booking.address ? formatPatientAddress(booking.address) : "—"}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {booking.sessionType ?? (typeof booking.session === "string" ? booking.session : booking.session?.type) ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{booking.status ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
