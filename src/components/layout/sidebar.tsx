"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Box, Layers, Network, Server, HardDrive, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const navigation = [
    { name: 'Dashboard', href: '/', icon: Server },
    { name: 'Containers', href: '/containers', icon: Box },
    { name: 'Images', href: '/images', icon: HardDrive },
    { name: 'Networks', href: '/networks', icon: Network },
    { name: 'Stacks', href: '/stacks', icon: Layers },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex h-full w-64 flex-col border-r border-white/20 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl z-20">
            <div className="flex h-14 items-center border-b border-white/20 dark:border-white/10 px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Box className="h-6 w-6" />
                    <span className="">Docker Manager</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50",
                                    isActive ? "bg-white/70 dark:bg-zinc-800/70 shadow-sm border border-white/50 dark:border-white/10 text-primary backdrop-blur-md" : ""
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-white/20 dark:border-white/10 p-4 space-y-1">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-white/50 dark:hover:bg-zinc-800/50",
                        pathname === "/settings" ? "bg-white/70 dark:bg-zinc-800/70 shadow-sm border border-white/50 dark:border-white/10 text-primary backdrop-blur-md" : ""
                    )}
                >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-red-500/80 transition-all hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                </button>
            </div>
        </div>
    );
}
