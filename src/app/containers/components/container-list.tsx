"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import { useLanguage } from "@/i18n/LanguageContext";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Play, Square, RotateCcw, Trash2, Terminal, FileText
} from "lucide-react";
import { toast } from "sonner";
import { ContainerInfo } from "dockerode";

import { ContainerLogs } from "./container-logs";
import { ContainerTerminal } from "./container-terminal";

export function ContainerList() {
    const { t, locale } = useLanguage();
    const [containers, setContainers] = useState<ContainerInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsOpen, setLogsOpen] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState<{ id: string, name: string } | null>(null);

    const dateLocales: Record<string, any> = { de, en: enUS, es, fr };
    const dateLocale = dateLocales[locale] || de;

    const fetchContainers = async () => {
        try {
            const res = await fetch("/api/containers");
            if (!res.ok) throw new Error("Fehler beim Abrufen der Container");
            const data = await res.json();
            setContainers(data);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, 5000); // Auto-Refresh alle 5s
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id: string, action: string) => {
        toast.promise(
            fetch(`/api/containers/${id}/${action}`, { method: 'POST' }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || `Aktion ${action} fehlgeschlagen`);
                }
                return res.json();
            }),
            {
                loading: `Führe ${action} aus...`,
                success: (data) => {
                    fetchContainers();
                    return data.message;
                },
                error: (err) => err.message,
            }
        );
    };

    const openLogs = (id: string, name: string) => {
        setSelectedContainer({ id, name });
        setLogsOpen(true);
    };

    const openTerminal = (id: string, name: string) => {
        setSelectedContainer({ id, name });
        setTerminalOpen(true);
    };

    if (loading) return <div>{t.common.loading}</div>;

    return (
        <>
            <div className="rounded-2xl border border-white/30 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl overflow-hidden shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.common.name}</TableHead>
                            <TableHead>{t.containers.state}</TableHead>
                            <TableHead>{t.containers.image}</TableHead>
                            <TableHead>{t.containers.ports}</TableHead>
                            <TableHead>{t.images.created}</TableHead>
                            <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {containers.map((container) => {
                            const name = container.Names[0].replace(/^\//, '');
                            const isRunning = container.State === 'running';

                            return (
                                <TableRow key={container.Id}>
                                    <TableCell className="font-medium">{name}</TableCell>
                                    <TableCell>
                                        <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-green-500 hover:bg-green-600" : ""}>
                                            {container.State}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={container.Image}>
                                        {container.Image}
                                    </TableCell>
                                    <TableCell>
                                        {container.Ports.filter(p => p.PublicPort).map(p => `${p.PublicPort}:${p.PrivatePort}`).join(', ') || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDistanceToNow(new Date(container.Created * 1000), { addSuffix: true, locale: dateLocale })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {isRunning ? (
                                                <Button variant="outline" size="icon" onClick={() => handleAction(container.Id, 'stop')} title={t.containers.stop}>
                                                    <Square className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="icon" onClick={() => handleAction(container.Id, 'start')} title={t.containers.start}>
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="outline" size="icon" onClick={() => handleAction(container.Id, 'restart')} title={t.containers.restart}>
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => handleAction(container.Id, 'delete')} title={t.containers.remove}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="w-px h-8 bg-border mx-1"></div>
                                            <Button variant="secondary" size="icon" onClick={() => openLogs(container.Id, name)} title={t.containers.logs}>
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button variant="secondary" size="icon" onClick={() => openTerminal(container.Id, name)} title={t.containers.terminal} disabled={!isRunning}>
                                                <Terminal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {containers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    {t.containers.noContainers}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <ContainerLogs
                containerId={selectedContainer?.id || null}
                containerName={selectedContainer?.name || null}
                isOpen={logsOpen}
                onOpenChange={setLogsOpen}
            />
            <ContainerTerminal
                containerId={selectedContainer?.id || null}
                containerName={selectedContainer?.name || null}
                isOpen={terminalOpen}
                onOpenChange={setTerminalOpen}
            />
        </>
    );
}
