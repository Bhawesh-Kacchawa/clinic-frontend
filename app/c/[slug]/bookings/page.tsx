import Link from "next/link";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import { ClinicBookingsTable } from "@/components/ClinicBookingsTable";
import type { DailyBooking } from "@/types/bookings";

export const dynamic = "force-dynamic";

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
      "/api/staff/bookings",
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${(await cookies()).get("access_token")?.value ?? ""}`,
        },
      },
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
        {/* <p className="mt-3 text-slate-600">{slug}</p> */}

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
          <ClinicBookingsTable slug={slug} initialBookings={bookings} />
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
