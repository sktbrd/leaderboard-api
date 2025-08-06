// file: src/app/layout.tsx (Server Component by default)
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skatehive API",
  description: "API for Skatehive",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
