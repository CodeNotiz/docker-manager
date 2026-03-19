"use client";

import { useEffect, useState } from "react";
import { Server, Box, Layers } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePathname } from "next/navigation";

export function Footer() {
    const { t } = useLanguage();
    const [data, setData] = useState<{
        version?: string;
        api?: string;
        os?: string;
        arch?: string;
        containers?: number;
        stacks?: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === "/login") {
            setLoading(false);
            return;
        }

        fetch("/api/stats")
            .then((res) => res.json())
            .then((json) => {
                if (json.dockerInfo) {
                    setData({
                        version: json.dockerInfo.version,
                        api: json.dockerInfo.api,
                        os: json.dockerInfo.os,
                        arch: json.dockerInfo.arch,
                        containers: json.containers,
                        stacks: json.stacks,
                    });
                }
            })
            .catch((err) => console.error("Fehler beim Laden der Footer-Daten:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <footer className="flex h-10 shrink-0 items-center justify-between border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl px-4 lg:px-6 text-xs text-zinc-600 dark:text-zinc-400 z-20">

            {/* Linke Seite: Engine & Live-Statistiken */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline font-medium">{t.common?.dockerEngine || "Docker Engine"}</span>
                </div>

                {!loading && data && (
                    <div className="flex items-center gap-3 border-l border-zinc-300 dark:border-zinc-700 pl-3">
                        <div className="flex items-center gap-1.5" title={t.common?.currentContainers || "Aktuelle Container"}>
                            <Box className="h-3.5 w-3.5" />
                            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{data.containers ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title={t.common?.currentStacks || "Aktuelle Stacks"}>
                            <Layers className="h-3.5 w-3.5" />
                            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{data.stacks ?? 0}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Rechte Seite: Versionen und Systeminfos */}
            <div className="flex items-center gap-4">
                {loading ? (
                    <span className="animate-pulse">{t.common?.loadingSystemInfo || "Lade Systeminfos..."}</span>
                ) : data ? (
                    <>
                        <span className="hidden md:inline text-zinc-400 dark:text-zinc-500">
                            {t.common?.os || "Betriebssystem"}: <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{data.os}</span> / <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{data.arch}</span>
                        </span>
                        <span>
                            {t.common?.dockerVersion || "Docker Version"}: <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{data.version}</span>
                        </span>
                        <span className="hidden sm:inline">
                            {t.common?.dockerApiVersion || "Docker API Version"}: <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{data.api}</span>
                        </span>
                    </>
                ) : (
                    <span className="text-red-500/80 font-medium">{t.common?.notReachable || "Nicht erreichbar"}</span>
                )}
            </div>
        </footer>
    );
}