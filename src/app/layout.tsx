import "~/styles/globals.css";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        fw: 500,
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
});

export const metadata: Metadata = {
  title: "Pathfinder - AI Course Generator",
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
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider 
          theme={theme} 
          defaultColorScheme="auto"
          // Force client-side color scheme resolution
          forceColorScheme={undefined}
        >
          <Notifications 
            position="top-right" 
            zIndex={1000}
            limit={5}
          />
          <TRPCReactProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </TRPCReactProvider>
        </MantineProvider>
      </body>
    </html>
  );
}