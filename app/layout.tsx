import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dental Frontend",
  description: "Dental care management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
