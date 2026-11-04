import { apiFetch } from "@/lib/api";
import type { SessionAvailability, SessionName, SessionStatus } from "@/types/sessions";

const sessionOrder: SessionName[] = ["Morning", "Evening"];

const statusLabels: Record<SessionStatus, string> = {
  "opens-soon": "Opens soon",
  open: "Open",
  full: "Full",
  closed: "Closed",
};

const statusStyles: Record<SessionStatus, string> = {
  "opens-soon": "bg-amber-100 text-amber-800",
  open: "bg-emerald-100 text-emerald-800",
  full: "bg-slate-100 text-slate-700",
  closed: "bg-rose-100 text-rose-800",
};

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

  const sessionsByName = new Map(sessions.map((session) => [session.name, session]));

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
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {sessionOrder.map((name) => {
              const session = sessionsByName.get(name);

              return (
                <article
                  key={name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
                    {session && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[session.status]}`}
                      >
                        {statusLabels[session.status]}
                      </span>
                    )}
                  </div>
                  {session ? (
                    <>
                      <p className="mt-4 text-slate-600">{session.timing}</p>
                      <p className="mt-6 text-sm text-slate-500">
                        <span className="font-semibold text-slate-900">
                          {session.slotsLeft}
                        </span>{" "}
                        {session.slotsLeft === 1 ? "slot" : "slots"} left
                      </p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No session data available.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
