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
import { de } from "date-fns/locale";
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
    const [images, setImages] = useState<DockerImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/images");
            if (!res.ok) throw new Error("Fehler beim Laden der Images");
            const data = await res.json();
            setImages(data);
        } catch (error) {
            toast.error("Images konnten nicht geladen werden.");
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
            toast.error(`Fehler: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePrune = async (allUnused: boolean = false) => {
        const msg = allUnused
            ? "Möchtest du wirklich ALLE unbenutzten Images (auch benannte) löschen?"
            : "Möchtest du wirklich alle Dangling Images (Images ohne Tag/Namen) löschen?";

        if (!confirm(msg)) return;

        setActionLoading("prune");
        try {
            const res = await fetch("/api/images/prune", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: allUnused }),
            });
            if (!res.ok) throw new Error("Prune fehlgeschlagen");

            const data = await res.json();
            toast.success(`Prune erfolgreich. ${data.deletedImages.length} Images gelöscht, ${formatSize(data.spaceReclaimed)} freigegeben.`);
            await fetchImages();
        } catch (error: any) {
            toast.error(`Prune fehlgeschlagen: ${error.message}`);
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
                        {actionLoading === "prune" ? "Bereinige..." : "Dangling Images bereinigen"}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handlePrune(true)}
                        disabled={actionLoading !== null}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Alle unbenutzten Images bereinigen
                    </Button>
                </div>

                <Button variant="outline" onClick={fetchImages} disabled={loading}>
                    Aktualisieren
                </Button>
            </div>

            <div className="rounded-2xl border border-white/30 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl overflow-hidden shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                            <TableHead>Repository</TableHead>
                            <TableHead>Tag</TableHead>
                            <TableHead>Image ID</TableHead>
                            <TableHead>Erstellt</TableHead>
                            <TableHead>Größe</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    Lade Images...
                                </TableCell>
                            </TableRow>
                        ) : images.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    Keine Images gefunden.
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
                                                            <p>Unbenutztes Image</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            {img.IsDangling && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger render={<span className="flex h-2 w-2 rounded-full bg-red-500"></span>} />
                                                        <TooltipContent>
                                                            <p>Dangling Image (Ohne Tag)</p>
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
                                            locale: de,
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
                                                title="Löschen"
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
