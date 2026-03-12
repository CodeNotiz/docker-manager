"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Box, HardDrive, Layers, Network } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [data, setData] = useState({
    containers: 0,
    images: 0,
    networks: 0,
    stacks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Statistiken", err);
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
    {
      title: t.dashboard.containers,
      value: data.containers,
      icon: Box,
      gradient: "from-blue-500 to-cyan-500",
      href: "/containers",
    },
    {
      title: t.dashboard.images,
      value: data.images,
      icon: HardDrive,
      gradient: "from-purple-500 to-pink-500",
      href: "/images",
    },
    {
      title: t.dashboard.networks,
      value: data.networks,
      icon: Network,
      gradient: "from-orange-500 to-red-500",
      href: "/networks",
    },
    {
      title: t.dashboard.stacks,
      value: data.stacks,
      icon: Layers,
      gradient: "from-emerald-500 to-teal-500",
      href: "/stacks",
    },
  ];

  return (
    <div className="flex flex-col gap-8 relative font-mono mt-4">
      <div className="relative z-10 border-l-[3px] border-primary pl-4 py-1">
        <h1 className="text-3xl font-bold tracking-widest text-white uppercase">
          {t.dashboard.title}
        </h1>
        <p className="text-zinc-500 mt-1 text-xs uppercase tracking-widest">
          {t.dashboard.subtitle.toLowerCase()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {statsProps.map((stat, i) => (
          <Link
            href={stat.href}
            key={i}
            className="group relative overflow-hidden border border-zinc-800 bg-black p-5 transition-none block cursor-pointer hover:bg-zinc-900/50"
          >
            {/* Hover Glitch Effect Line */}
            <div
              className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:opacity-100 transition-none`}
            />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[10px] tracking-widest uppercase text-zinc-500 group-hover:text-white transition-none">
                {stat.title}
              </h3>
              <stat.icon className="w-4 h-4 text-zinc-600 transition-none group-hover:animate-pulse" />
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tighter text-white">
                {loading ? "..." : stat.value}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient}`}
              >
                TOTAL
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
