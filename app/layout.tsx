import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrbitWatch – Real-Time Satellite Tracking",
  description:
    "Track satellites in real-time with 3D globe and 2D map views, pass predictions, and analytics.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased overflow-hidden">{children}</body>
    </html>
  );
}
