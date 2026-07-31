import MainLayout from "@/components/layout/MainLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { IdleTimerProvider } from "@/components/auth/IdleTimerProvider";
import { AppAlertProvider } from "@/components/ui/app-alert-provider";
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
  title: "Arkanin v1.0",
  description: "Arkanin - Edutech Platform",
  icons: {
    icon: '/logo/arkanin.ico',
    apple: '/logo/arkanin-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <ThemeInitializer />
          <AppAlertProvider />
          <IdleTimerProvider>
            <MainLayout>{children}</MainLayout>
          </IdleTimerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
