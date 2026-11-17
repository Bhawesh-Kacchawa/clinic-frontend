import { PatientQueue } from "@/components/PatientQueue";

export default function PatientDisplayPage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Patient display
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Today&apos;s queue
        </h1>
        <p className="mt-3 text-slate-600">
          Please watch for your token number to be called.
        </p>
        <PatientQueue />
      </section>
    </main>
  );
}
