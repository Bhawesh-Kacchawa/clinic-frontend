import { apiFetch } from "@/lib/api";
import { SessionCards } from "@/components/SessionCards";
import type { SessionAvailability } from "@/types/sessions";

export default async function ClinicSessionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let sessions: SessionAvailability[];
  let loadError: string | null = null;

  try {
    const query = new URLSearchParams({ slug });
    sessions = await apiFetch<SessionAvailability[]>(`/sessions?${query}`);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load sessions.";
    sessions = [];
  }

  return (
    <main className="min-h-screen px-6 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Available sessions
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Choose a time
        </h1>
        <p className="mt-3 text-slate-600">{slug}</p>

        {loadError ? (
          <p
            role="alert"
            className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
          >
            Sessions could not be loaded: {loadError}
          </p>
        ) : (
          <SessionCards slug={slug} initialSessions={sessions} />
        )}
      </section>
    </main>
  );
}
