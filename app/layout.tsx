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
          {`(function(){
            if (!('serviceWorker' in navigator)) return;
            var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            if (isLocal) {
              // In development, ensure any existing SW is unregistered to avoid stale asset caching
              navigator.serviceWorker.getRegistrations().then(function(regs){
                regs.forEach(function(r){ r.unregister(); });
              }).catch(function(){});
            } else {
              // In production, register the SW
              window.addEventListener('load', function(){
                navigator.serviceWorker.register('/sw.js').catch(function(){});
              });
            }
          })();`}
        </script>
        <Nav />
        {children}
      </body>
    </html>
  );
}
