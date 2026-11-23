import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Doctor Frontend
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Sign in
        </h1>
        <p className="mt-3 text-slate-600">
          Sign in to access your clinic dashboard.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
