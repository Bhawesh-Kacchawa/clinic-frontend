import Link from "next/link";
import { DashboardQueue } from "@/components/DashboardQueue";

export default function DashboardQueuePage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Live queue
        </h1>
        <p className="mt-3 text-slate-600">
          Manage patient calls and attendance for the selected session.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/dashboard/sessions"
            className="text-sm font-semibold text-cyan-800 underline underline-offset-4"
          >
            Manage sessions
          </Link>
          <Link
            href="/dashboard/patient-display"
            className="text-sm font-semibold text-cyan-800 underline underline-offset-4"
          >
            Open patient display
          </Link>
          <Link
            href="/dashboard/patients"
            className="text-sm font-semibold text-cyan-800 underline underline-offset-4"
          >
            View patients
          </Link>
        </div>
        <DashboardQueue />
      </section>
    </main>
  );
}
