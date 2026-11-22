import Link from "next/link";
import { PatientQueue } from "@/components/PatientQueue";

export function PatientDisplay({ screen = false }: { screen?: boolean }) {
  return (
    <main className="px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Patient display
        </p>
        {/* <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Today&apos;s queue
        </h1> */}
        <p className="mt-3 text-slate-600">
          Please watch for your token number to be called.
        </p>
        {!screen && (
          <Link
            href="/dashboard/patient-display/screen"
            className="mt-4 inline-flex rounded-xl border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
          >
            Open waiting room screen
          </Link>
        )}
        <PatientQueue followServing={screen} />
      </section>
    </main>
  );
}
