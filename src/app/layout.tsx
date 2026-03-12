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
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined;
  const initialLocale: Locale = ["de", "en", "es", "fr"].includes(
    localeCookie as string,
  )
    ? localeCookie!
    : "de";

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Force dark mode aesthetic
          enableSystem={false} // Disable auto-switching for this aesthetic
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={initialLocale}>
            {/* Raw Industrial Background - Deep Black with subtle grid */}
            <div className="fixed inset-0 z-[-2] bg-black" />

            {/* Very faint terminal grid background */}
            <div
              className="fixed inset-0 z-[-1] opacity-5 mix-blend-screen pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="flex w-full h-full relative">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden relative border-l border-zinc-800">
                <Header />
                <main className="flex-1 overflow-auto p-4 lg:p-6 bg-zinc-950/20">
                  {children}
                </main>
              </div>
            </div>
            <Toaster position="bottom-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
