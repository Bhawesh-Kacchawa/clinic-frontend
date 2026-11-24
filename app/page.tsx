import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-cyan-100 bg-white p-8 shadow-xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Doctor Frontend
        </p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Book your Doctor visit
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-600">
          Choose a session at Demo Doctor, reserve your place, and keep track of
          your token and queue status.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/c/demo-doctor"
            className="rounded-xl shadow-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
          >
            View sessions
          </Link>
          <Link
            href="/c/demo-doctor/bookings"
            className="rounded-xl shadow-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
          >
            Today&apos;s clinic bookings
          </Link>
          <Link
            href="/login"
            className="rounded-xl shadow-lg border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
          >
            Staff login
          </Link>
        </div>
      </section>
    </main>
  );
}
