import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/app/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track and manage your job applications with a Kanban board.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0ea5e9",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script>
          {`if ('serviceWorker' in navigator) {
             window.addEventListener('load', () => {
               navigator.serviceWorker.register('/sw.js').catch(() => {});
             });
           }`}
        </script>
        <Nav />
        {children}
      </body>
    </html>
  );
}
