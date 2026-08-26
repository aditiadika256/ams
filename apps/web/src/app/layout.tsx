import MainLayout from "@/components/layout/MainLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { IdleTimerProvider } from "@/components/auth/IdleTimerProvider";
import { AppAlertProvider } from "@/components/ui/app-alert-provider";
import type { Metadata } from "next";
import "./globals.css";

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
      <body>
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
