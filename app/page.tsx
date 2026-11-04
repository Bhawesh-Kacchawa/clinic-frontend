export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Dental Frontend
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Your app is ready.
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-600">
          Start building your dental care experience with Next.js, TypeScript,
          and Tailwind CSS.
        </p>
      </section>
    </main>
  );
}
