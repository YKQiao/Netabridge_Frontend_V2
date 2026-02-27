import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { MsalProvider } from "@/lib/auth/MsalProvider";
import { PreviewBanner } from "@/components/ui/PreviewBanner";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NetaBridge",
  description: "Trade with people you know",
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
        <MsalProvider>{children}</MsalProvider>
      </body>
    </html>
  );
}
