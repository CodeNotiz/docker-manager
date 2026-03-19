"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export function ContainerStats({ id }: { id: string }) {
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchStats = async () => {
            try {

                const res = await fetch(`/api/containers/${id}`);
                if (!res.ok) throw new Error("Fehler beim Abrufen der Container-Daten");

                const data = await res.json();
                if (data.stats) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Live-Stats Fehler:", err);
                setError(true);
            }
        };

        fetchStats();

        const interval = setInterval(fetchStats, 3000);

        return () => clearInterval(interval);
    }, [id]);

    if (error) return null;

    if (!stats) {
        return (
            <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg">
                <div className="animate-pulse flex space-x-4 text-sm text-zinc-500">
                    {t.containers.detailsLoadingResources}
                </div>
            </div>
        );
    }

    const memoryUsage = stats.memory_stats?.usage || 0;
    const memoryLimit = stats.memory_stats?.limit || 0;
    const memoryMb = (memoryUsage / 1024 / 1024).toFixed(2);

    let memoryPercent = "0.00";
    if (memoryLimit > 0) {
        memoryPercent = ((memoryUsage / memoryLimit) * 100).toFixed(2);
    }

    const cpuDelta = (stats.cpu_stats?.cpu_usage?.total_usage || 0) - (stats.precpu_stats?.cpu_usage?.total_usage || 0);
    const systemDelta = (stats.cpu_stats?.system_cpu_usage || 0) - (stats.precpu_stats?.system_cpu_usage || 0);
    const cpus = stats.cpu_stats?.online_cpus || 1;

    let cpuPercent = "0.00";
    if (systemDelta > 0 && cpuDelta > 0) {
        cpuPercent = ((cpuDelta / systemDelta) * cpus * 100).toFixed(2);
    }

    return (
        <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                {t.containers.detailsResources}
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <span className="text-sm text-zinc-500 block">{t.containers.detailsCpuUsage}</span>
                    <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {cpuPercent}%
                    </span>
                </div>
                <div>
                    <span className="text-sm text-zinc-500 block">{t.containers.detailsMemoryUsage}</span>
                    <span className="font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        {memoryMb} MB <span className="text-sm text-zinc-500">({memoryPercent}%)</span>
                    </span>
                </div>
            </div>
        </div>
    );
}