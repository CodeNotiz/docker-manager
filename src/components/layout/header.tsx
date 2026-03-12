"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { locale, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(console.error)
      .finally(() => setAuthLoading(false));
  }, []);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-black px-4 lg:h-[60px] lg:px-6 z-20 font-mono text-sm">
      <div className="w-full flex-1">
        {/* Decorative terminal prompt */}
        <span className="text-zinc-600 select-none hidden sm:inline-block">
          system@docker-mgr:~#
        </span>
        <span className="text-primary ml-2 animate-pulse">_</span>
      </div>
      {mounted && (
        <div className="flex items-center gap-4">
          {!authLoading && (
            <div className="text-xs text-zinc-500 uppercase tracking-widest hidden sm:block border-r border-zinc-800 pr-4">
              {user ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      t.common?.welcome?.replace(
                        "{name}",
                        `<strong class="text-zinc-100">${user.username}</strong>`,
                      ) ||
                      `[SYS_USER: <strong class="text-zinc-100">${user.username}</strong>]`,
                  }}
                />
              ) : (
                <span>[AUTH_REQUIRED]</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-xs font-mono uppercase tracking-widest transition-none focus-visible:outline-none hover:bg-zinc-800 hover:text-white h-8 px-3 border border-zinc-800">
                <Globe className="h-[1rem] w-[1rem] mr-2" />
                {locale}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-black border-zinc-800 font-mono text-xs rounded-none"
              >
                <DropdownMenuItem
                  onClick={() => setLanguage("de")}
                  className={`rounded-none focus:bg-primary focus:text-black cursor-pointer ${locale === "de" ? "text-primary" : "text-zinc-400"}`}
                >
                  [DE] DEUTSCH
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={`rounded-none focus:bg-primary focus:text-black cursor-pointer ${locale === "en" ? "text-primary" : "text-zinc-400"}`}
                >
                  [EN] ENGLISH
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("es")}
                  className={`rounded-none focus:bg-primary focus:text-black cursor-pointer ${locale === "es" ? "text-primary" : "text-zinc-400"}`}
                >
                  [ES] ESPAÑOL
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("fr")}
                  className={`rounded-none focus:bg-primary focus:text-black cursor-pointer ${locale === "fr" ? "text-primary" : "text-zinc-400"}`}
                >
                  [FR] FRANÇAIS
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </header>
  );
}
