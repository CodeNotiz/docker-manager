import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Locale } from "@/i18n/config";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Docker Manager",
  description: "Webbasierte Docker-Verwaltungsanwendung",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Extract Locale Cookie Serverside
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;
  const initialLocale: Locale = ['de', 'en', 'es', 'fr', 'uk', 'ru', 'ja', 'zh'].includes(localeCookie as string) ? localeCookie! : 'de';

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={initialLocale}>
            {/* Futuristic Glassmorphism Background Elements */}
            <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900" />
            <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[120px] z-[-1] animate-pulse duration-[10000ms]" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-cyan-500/20 dark:bg-cyan-600/15 blur-[120px] z-[-1] animate-pulse duration-[12000ms]" />

            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto p-4 lg:p-6 bg-transparent">
                {children}
              </main>
            </div>
            <Toaster position="bottom-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
