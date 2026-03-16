"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Locale } from "@/i18n/config";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { locale, setLanguage, t } = useLanguage();
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        fetch("/api/auth/me")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.user) {
                    setUser(data.user);
                }
            })
            .catch(console.error)
            .finally(() => setAuthLoading(false));
    }, []);

    return (
        <header className="flex h-14 items-center gap-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl px-4 lg:h-[60px] lg:px-6 z-20">
            <div className="w-full flex-1"></div>
            {mounted && (
                <div className="flex items-center gap-4">
                    {!authLoading && (
                        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mr-2 hidden sm:block">
                            {user ? (
                                <span dangerouslySetInnerHTML={{ __html: t.common?.welcome?.replace('{name}', `<strong class="text-zinc-900 dark:text-zinc-100">${user.username}</strong>`) || `Willkommen, <strong class="text-zinc-900 dark:text-zinc-100">${user.username}</strong>` }} />
                            ) : (
                                <span>{t.common?.pleaseLogin || "Bitte anmelden"}</span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 h-9 w-9 px-0">
                                <Globe className="h-[1.2rem] w-[1.2rem]" />
                                <span className="sr-only">Toggle language</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-white/20">
                                <DropdownMenuItem onClick={() => setLanguage('de')} className={locale === 'de' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇩🇪 Deutsch
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('en')} className={locale === 'en' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇬🇧 English
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('es')} className={locale === 'es' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇪🇸 Español
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('fr')} className={locale === 'fr' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇫🇷 Français
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('uk')} className={locale === 'uk' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇺🇦 Українська
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('ru')} className={locale === 'ru' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇷🇺 Русский
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('ja')} className={locale === 'ja' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇯🇵 日本語
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('zh')} className={locale === 'zh' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}>
                                    🇨🇳 中文
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
