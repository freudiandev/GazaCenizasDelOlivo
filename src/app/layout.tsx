import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaza: Cenizas del Olivo",
  description:
    "Run-and-gun 2D sobre rescate, memoria y resistencia comunitaria.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
