import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { PreviewBanner } from "@/components/ui/PreviewBanner";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "NetaBridge - B2B Trading Network",
    template: "%s | NetaBridge",
  },
  description:
    "NetaBridge is a B2B trading network that connects businesses with trusted partners. Trade with people you know, discover new opportunities, and grow your network.",
  keywords: [
    "B2B trading",
    "business network",
    "trade platform",
    "wholesale",
    "supply chain",
    "business connections",
  ],
  authors: [{ name: "NetaBridge" }],
  creator: "NetaBridge",
  publisher: "NetaBridge",
  metadataBase: new URL("https://netabridge.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://netabridge.com",
    siteName: "NetaBridge",
    title: "NetaBridge - B2B Trading Network",
    description:
      "Connect with trusted business partners and trade efficiently. NetaBridge is the B2B trading network built for modern businesses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NetaBridge - B2B Trading Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NetaBridge - B2B Trading Network",
    description:
      "Connect with trusted business partners and trade efficiently. NetaBridge is the B2B trading network built for modern businesses.",
    images: ["/og-image.png"],
    creator: "@netabridge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ibmPlexSans.className} suppressHydrationWarning>
        <PreviewBanner />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
