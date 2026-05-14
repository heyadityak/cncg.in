import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "CNCG India — Cloud Native Community Groups",
  description:
    "Discover Cloud Native Community Groups across India. Find Kubernetes, cloud-native, and CNCF community groups near you.",
  keywords: [
    "CNCG",
    "Cloud Native",
    "Kubernetes",
    "CNCF",
    "India",
    "community",
  ],
  openGraph: {
    title: "CNCG India — Cloud Native Community Groups",
    description:
      "Discover Cloud Native Community Groups across India. Find the nearest CNCG event in your city.",
    url: "https://cncg.in",
    siteName: "CNCG India",
    locale: "en_IN",
    type: "website",
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
        {children}
      </body>
    </html>
  );
}
