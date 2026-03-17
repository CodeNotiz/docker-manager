"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Box, HardDrive, Layers, Network } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [data, setData] = useState({ containers: 0, images: 0, networks: 0, stacks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error(t.dashboard.fetchError, err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const statsProps = [
    { title: t.dashboard.containers, value: data.containers, icon: Box, gradient: "from-blue-500 to-cyan-500", href: "/containers" },
    { title: t.dashboard.images, value: data.images, icon: HardDrive, gradient: "from-purple-500 to-pink-500", href: "/images" },
    { title: t.dashboard.networks, value: data.networks, icon: Network, gradient: "from-orange-500 to-red-500", href: "/networks" },
    { title: t.dashboard.stacks, value: data.stacks, icon: Layers, gradient: "from-emerald-500 to-teal-500", href: "/stacks" },
  ];

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
          {t.dashboard.title}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {statsProps.map((stat, i) => (
          <Link href={stat.href} key={i} className="group relative overflow-hidden rounded-2xl border border-white/20 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 p-6 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 block cursor-pointer">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${stat.gradient}`} />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-zinc-700 dark:text-zinc-300">{stat.title}</h3>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-inner`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">
                {loading ? "..." : stat.value}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
