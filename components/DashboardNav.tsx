"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    href: "/dashboard/sessions",
    label: "Sessions",
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  },
  {
    href: "/dashboard/queue",
    label: "Live queue",
    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  {
    href: "/dashboard/patients",
    label: "Patient history",
    icon: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  },
  {
    href: "/dashboard/patient-display",
    label: "Patient display",
    icon: "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 22h8M12 18v4",
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  if (pathname === "/dashboard/patient-display/screen") return null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-6">
          <Link href="/dashboard" className="py-4 text-base font-semibold tracking-tight text-slate-900">
            Clinic workspace <span className="font-normal text-slate-500">/ Staff</span>
          </Link>
          <nav aria-label="Staff navigation" className="flex max-w-full gap-1 overflow-x-auto pb-2 sm:pb-0">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 transition focus:outline-none ${
                active
                  ? "bg-cyan-100 text-cyan-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-cyan-800"
              }`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
                <path d={item.icon} />
              </svg>
              <span className="whitespace-nowrap text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
          </nav>
        </div>
      </div>
    </header>
  );
}
