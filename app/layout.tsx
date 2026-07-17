import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import JsonLd from "@/components/json-ld";
import { organizationJsonLd, SITE_URL, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CNCG India — Cloud Native Community Groups & CNCF Chapters",
    template: "%s | CNCG India",
  },
  description:
    "Find every listed CNCF and Cloud Native Community Group (CNCG) across India. Discover local Kubernetes meetups, cloud-native events, and community chapters.",
  keywords: [
    "CNCF",
    "CNCG",
    "Cloud Native",
    "Cloud Native Community Groups",
    "Kubernetes",
    "CNCF India",
    "Cloud Native India",
    "community",
  ],
  openGraph: {
    title: "CNCG India — Cloud Native Community Groups & CNCF Chapters",
    description:
      "Find CNCF and Cloud Native Community Groups across India. Meetups, events, and local chapters near you.",
    url: SITE_URL,
    siteName: "CNCG India",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CNCG India — Cloud Native Community Groups & CNCF Chapters",
    description:
      "Find CNCF and Cloud Native Community Groups across India. Meetups, events, and local chapters near you.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
