import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spartan FC — Spartan Hub",
    template: "%s — Spartan FC",
  },
  description:
    "The home of Spartan FC: squad, player profiles, stats, leaderboards and match/training history.",
  icons: {
    icon: "/images/spartan-logo.jpeg",
  },
  openGraph: {
    title: "Spartan FC",
    description:
      "The home of Spartan FC: squad, player profiles, stats, leaderboards and match/training history.",
    images: ["/images/team-1.jpeg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
