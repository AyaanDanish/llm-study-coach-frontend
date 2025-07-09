import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TimerProvider } from "@/contexts/TimerContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const viewport: Viewport = {
  themeColor: "#4f46e5", // Indigo-600
};

export const metadata: Metadata = {
  title: "LLM Study Coach",
  description:
    "Your AI-powered learning assistant for personalized study plans and efficient learning",
  generator: "Next.js",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body>
        <ThemeProvider>
          <TimerProvider>{children}</TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
