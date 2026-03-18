"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, HardDrive, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de, enUS, es, fr, ja, ru, uk, zhCN } from "date-fns/locale";
import { useLanguage } from "@/i18n/LanguageContext";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface DockerImage {
    Id: string;
    ParentId: string;
    RepoTags: string[];
    Name: string;
    Tag: string;
    Size: number;
    Created: number;
    IsDangling: boolean;
    IsUnused: boolean;
}

export function ImageList() {
    const { t, locale } = useLanguage();
    const [images, setImages] = useState<DockerImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const dateLocales: Record<string, any> = { de, en: enUS, es, fr, ja, ru, uk, zh: zhCN };
    const dateLocale = dateLocales[locale] || enUS;

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/images");
            if (!res.ok) throw new Error(t.images.fetchError);
            const data = await res.json();
            setImages(data);
        } catch (error) {
            toast.error(t.images.toastError);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const formatSize = (bytes: number) => {
        const mb = bytes / 1024 / 1024;
        if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
        return `${mb.toFixed(2)} MB`;
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Möchtest du das Image ${name} wirklich löschen?`)) return;

        setActionLoading(id);
        try {
            const res = await fetch(`/api/images/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Löschen fehlgeschlagen");
            }

            toast.success("Image gelöscht");
            await fetchImages();
        } catch (error: any) {
            toast.error(`${t.images.error} ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePrune = async (allUnused: boolean = false) => {
        const msg = allUnused
            ? t.images.pruneAllAsk
            : t.images.pruneDanglingAsk;

        if (!confirm(msg)) return;

        setActionLoading("prune");
        try {
            const res = await fetch("/api/images/prune", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: allUnused }),
            });
            if (!res.ok) throw new Error(t.images.pruneError);

            const data = await res.json();
			const successMsg = t.images.pruneSuccess
				.replace("{count}", data.deletedImages.length.toString())
				.replace("{size}", formatSize(data.spaceReclaimed));

			toast.success(successMsg);
            await fetchImages();
        } catch (error: any) {
            toast.error(`${t.images.pruneError}: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                        onClick={() => handlePrune(false)}
                        disabled={actionLoading !== null}
                    >
                        <HardDrive className="w-4 h-4" />
                        {actionLoading === "prune" ? t.common.loading : t.images.pruneDangling}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handlePrune(true)}
                        disabled={actionLoading !== null}
                    >
                        <AlertCircle className="w-4 h-4" />
                        {t.images.pruneAll}
                    </Button>
                </div>

                <Button variant="outline" onClick={fetchImages} disabled={loading}>
                    {t.common.refresh}
                </Button>
            </div>

            <div className="rounded-2xl border border-white/30 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl overflow-hidden shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                            <TableHead>{t.images.repository}</TableHead>
                            <TableHead>{t.images.tag}</TableHead>
                            <TableHead>{t.images.id}</TableHead>
                            <TableHead>{t.images.created}</TableHead>
                            <TableHead>{t.images.size}</TableHead>
                            <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    {t.common.loading}
                                </TableCell>
                            </TableRow>
                        ) : images.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    {t.images.noImages}
                                </TableCell>
                            </TableRow>
                        ) : (
                            images.map((img) => (
                                <TableRow key={img.Id} className="border-zinc-200 dark:border-zinc-800 group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {img.Name}
                                            {img.IsUnused && !img.IsDangling && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger render={<span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>} />
                                                        <TooltipContent>
                                                            <p>{t.images.unusedImage}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            {img.IsDangling && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger render={<span className="flex h-2 w-2 rounded-full bg-red-500"></span>} />
                                                        <TooltipContent>
                                                            <p>{t.images.danglingImage}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${img.IsDangling ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                            {img.Tag}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 font-mono text-xs">
                                        {img.Id.split(":")[1]?.substring(0, 12) || img.Id.substring(0, 12)}
                                    </TableCell>
                                    <TableCell className="text-zinc-500">
                                        {formatDistanceToNow(new Date(img.Created * 1000), {
                                            addSuffix: true,
                                            locale: dateLocale,
                                        })}
                                    </TableCell>
                                    <TableCell className="text-zinc-500">
                                        {formatSize(img.Size)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                onClick={() => handleDelete(img.Id, img.Name)}
                                                disabled={actionLoading === img.Id}
                                                title={t.images.remove}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
