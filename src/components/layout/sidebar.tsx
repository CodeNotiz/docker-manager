"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Box,
  Layers,
  Network,
  Server,
  HardDrive,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navigation = [
    { name: t.sidebar.dashboard, href: "/", icon: Server },
    { name: t.sidebar.containers, href: "/containers", icon: Box },
    { name: t.sidebar.images, href: "/images", icon: HardDrive },
    { name: t.sidebar.networks, href: "/networks", icon: Network },
    { name: t.sidebar.stacks, href: "/stacks", icon: Layers },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-black z-20 font-mono text-sm">
      <div className="flex h-14 items-center border-b border-zinc-800 px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-white hover:text-primary transition-colors"
        >
          <Box className="h-5 w-5 text-primary" />
          <span className="tracking-widest uppercase text-xs">
            DOCKER_MGR v1.0
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-3 py-4 gap-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 transition-none border",
                  isActive
                    ? "bg-primary text-black border-primary tracking-wide font-bold"
                    : "text-zinc-400 border-transparent hover:border-zinc-700 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name.toUpperCase()}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-800 p-4 space-y-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 transition-none border",
            pathname === "/settings"
              ? "bg-primary text-black border-primary tracking-wide font-bold"
              : "text-zinc-400 border-transparent hover:border-zinc-700 hover:text-white",
          )}
        >
          <Settings className="h-4 w-4" />
          {t.sidebar.settings.toUpperCase()}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-destructive border border-transparent transition-none hover:bg-destructive hover:text-black hover:font-bold"
        >
          <LogOut className="h-4 w-4" />
          {t.sidebar.logout.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
