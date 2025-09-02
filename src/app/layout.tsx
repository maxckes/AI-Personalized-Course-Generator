import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { AntdConfig } from "~/lib/antd-config";
import { ThemeProvider } from "~/lib/theme-context";

export const metadata: Metadata = {
  title: "LearnForge AI - AI Course Generator",
  description: "Generate personalized courses with AI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AntdConfig>
            <TRPCReactProvider>
              <SessionProvider>
                {children}
              </SessionProvider>
            </TRPCReactProvider>
          </AntdConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}