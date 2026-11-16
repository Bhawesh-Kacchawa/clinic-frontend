import Link from "next/link";
import { DashboardSessions } from "@/components/DashboardSessions";

export default function DashboardSessionsPage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Manage sessions
        </h1>
        <p className="mt-3 text-slate-600">
          Create or edit clinic hours and manage booking availability for each
          session.
        </p>
        <Link
          href="/dashboard/queue"
          className="mt-4 inline-flex text-sm font-semibold text-cyan-800 underline underline-offset-4"
        >
          Manage patient queue
        </Link>
        <DashboardSessions />
      </section>
    </main>
  );
}
