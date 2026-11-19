import { DashboardSessions } from "@/components/DashboardSessions";

export default function DashboardSessionsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <section className="mx-auto w-full max-w-5xl">
        {/* <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p> */}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Manage sessions
        </h1>
        <p className="mt-3 text-slate-600">
          Create or edit clinic hours and manage booking availability for each
          session.
        </p>
        <DashboardSessions />
      </section>
    </main>
  );
}
