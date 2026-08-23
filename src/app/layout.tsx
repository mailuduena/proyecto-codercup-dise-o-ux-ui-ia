import type { Metadata } from "next";
import type { ReactNode } from "react";

// Fuentes auto-hospedadas vía @fontsource: no dependen de un fetch a Google
// Fonts en build time, lo cual es más confiable para un deploy de un día.
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "CoderCup — De la evidencia a la decisión",
  description:
    "Plataforma UX/UI con IA aplicada a Design Thinking. La IA propone, el profesional decide.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface-base text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
