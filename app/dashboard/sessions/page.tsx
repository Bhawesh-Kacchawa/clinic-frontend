import { DashboardSessions } from "@/components/DashboardSessions";

export default function DashboardSessionsPage() {
  return (
    <main className="px-2 py-2 sm:px-2 sm:py-2 lg:px-1">
      <section className="mx-auto w-full max-w-5xl">
        {/* <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p> */}
        <h1 className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 sm:text-xl">
          Manage sessions
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create or edit clinic hours and manage booking availability for each
          session.
        </p>
        <DashboardSessions />
      </section>
    </main>
  );
}
