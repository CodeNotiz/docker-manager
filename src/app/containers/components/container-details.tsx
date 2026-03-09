"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import { useLanguage } from "@/i18n/LanguageContext";

interface ContainerDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    containerId: string | null;
    containerName: string;
}

export function ContainerDetails({ open, onOpenChange, containerId, containerName }: ContainerDetailsProps) {
    const { t, locale } = useLanguage();
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const dateLocales: Record<string, any> = { de, en: enUS, es, fr };
    const dateLocale = dateLocales[locale] || de;

    useEffect(() => {
        if (!open || !containerId) {
            setDetails(null);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/containers/${containerId}`);
                if (res.ok) {
                    const data = await res.json();
                    setDetails(data);
                }
            } catch (error) {
                console.error("Failed to fetch container details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [open, containerId]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] w-[90vw] overflow-y-auto bg-white/50 dark:bg-zinc-950/50 backdrop-blur-3xl border-white/20 dark:border-zinc-800/50">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-3">
                        <span className="font-mono text-xl">{containerName}</span>
                        {details && (
                            <Badge variant={details.State.Running ? "default" : "secondary"} className={details.State.Running ? "bg-green-500" : ""}>
                                {details.State.Status}
                            </Badge>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {loading ? (
                    <div className="flex h-40 items-center justify-center text-zinc-500">
                        {t.common.loading}...
                    </div>
                ) : !details ? (
                    <div className="text-zinc-500">Keine Details gefunden</div>
                ) : (
                    <div className="space-y-8 pb-12">
                        {/* Basis Info */}
                        <section>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Allgemein</h3>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <span className="text-zinc-500 font-medium">ID:</span>
                                <span className="col-span-2 font-mono truncate text-zinc-700 dark:text-zinc-300" title={details.Id}>{details.Id.substring(0, 12)}</span>

                                <span className="text-zinc-500 font-medium">Image:</span>
                                <span className="col-span-2 font-mono truncate text-zinc-700 dark:text-zinc-300" title={details.Config.Image}>{details.Config.Image}</span>

                                <span className="text-zinc-500 font-medium">Created:</span>
                                <span className="col-span-2 text-zinc-700 dark:text-zinc-300">
                                    {formatDistanceToNow(new Date(details.Created), { addSuffix: true, locale: dateLocale })}
                                </span>

                                <span className="text-zinc-500 font-medium">Path:</span>
                                <span className="col-span-2 font-mono truncate text-zinc-700 dark:text-zinc-300">{details.Path}</span>
                            </div>
                        </section>

                        {/* Netzwerke */}
                        <section>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Netzwerke ({Object.keys(details.NetworkSettings.Networks).length})</h3>
                            <div className="space-y-3">
                                {Object.entries(details.NetworkSettings.Networks).map(([netName, netData]: [string, any]) => (
                                    <div key={netName} className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 text-sm">
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{netName}</div>
                                        <div className="grid grid-cols-2 gap-1 text-xs">
                                            <span className="text-zinc-500">IP-Adresse:</span>
                                            <span className="font-mono text-zinc-700 dark:text-zinc-300">{netData.IPAddress || '-'}</span>
                                            <span className="text-zinc-500">Gateway:</span>
                                            <span className="font-mono text-zinc-700 dark:text-zinc-300">{netData.Gateway || '-'}</span>
                                            <span className="text-zinc-500">Mac:</span>
                                            <span className="font-mono text-zinc-700 dark:text-zinc-300">{netData.MacAddress || '-'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Umgebungsvariablen */}
                        {details.Config.Env && details.Config.Env.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Environment Filter (ENV)</h3>
                                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 max-h-64 overflow-y-auto">
                                    <ul className="space-y-1 font-mono text-xs">
                                        {details.Config.Env.map((env: string, idx: number) => {
                                            const [key, ...valParts] = env.split('=');
                                            const val = valParts.join('=');
                                            return (
                                                <li key={idx} className="flex flex-col sm:flex-row gap-1 sm:gap-4 break-all">
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[120px] shrink-0">{key}</span>
                                                    <span className="text-zinc-600 dark:text-zinc-400">{val || '""'}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </section>
                        )}

                        {/* Mounts / Volumes */}
                        {details.Mounts && details.Mounts.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">Mounts ({details.Mounts.length})</h3>
                                <ul className="space-y-2 text-xs">
                                    {details.Mounts.map((mount: any, idx: number) => (
                                        <li key={idx} className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg break-all">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2">
                                                    <span className="text-zinc-500">Typ:</span>
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{mount.Type}</span>
                                                    <span className="text-zinc-500">Modus:</span>
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{mount.RW ? 'RW' : 'RO'}</span>
                                                </div>
                                                <div className="flex flex-col mt-1 bg-zinc-200 dark:bg-black/30 p-1.5 rounded font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                                                    <span>{mount.Source}</span>
                                                    <span className="text-center text-zinc-400 py-0.5">↓</span>
                                                    <span>{mount.Destination}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
