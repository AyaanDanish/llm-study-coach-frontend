import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Study Coach",
  description: "Created by Ayaan, Abby and Niloufar",
  generator: "v0.dev",
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
