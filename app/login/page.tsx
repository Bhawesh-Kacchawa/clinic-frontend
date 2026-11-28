import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="hidden md:block">
          <Image
            src="/images/loginImage.png"
            alt="Patients and staff in a clinic waiting area"
            width={1200}
            height={800}
            priority
            className="h-auto w-full object-contain"
          />
          <p className="mt-2 text-center text-xl uppercase font-bold text-cyan-900">
            Keep your waiting room calm
          </p>
        </div>
        <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Dental Frontend
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-3 text-slate-600">
            Sign in to access your clinic dashboard.
          </p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
