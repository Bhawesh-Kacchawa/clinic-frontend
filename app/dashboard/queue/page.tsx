import { DashboardQueue } from "@/components/DashboardQueue";

export default function DashboardQueuePage() {
  return (
    <main className="px-3 py-2 sm:px-8 sm:py-3 lg:px-2">
      <section className="mx-auto w-full max-w-6xl">
        {/* <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p> */}
        <h1 className="text-xl font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Live queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage patient calls and attendance for the selected session.
        </p>
        <DashboardQueue />
      </section>
    </main>
  );
}
