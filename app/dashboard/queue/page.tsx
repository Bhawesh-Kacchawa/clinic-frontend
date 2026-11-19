import { DashboardQueue } from "@/components/DashboardQueue";

export default function DashboardQueuePage() {
  return (
    <main className="px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        {/* <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Clinic dashboard
        </p> */}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Live queue
        </h1>
        <p className="mt-3 text-slate-600">
          Manage patient calls and attendance for the selected session.
        </p>
        <DashboardQueue />
      </section>
    </main>
  );
}
