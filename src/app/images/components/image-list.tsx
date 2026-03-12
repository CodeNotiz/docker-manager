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
import { de, enUS, es, fr } from "date-fns/locale";
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

  const dateLocales: Record<string, any> = { de, en: enUS, es, fr };
  const dateLocale = dateLocales[locale] || de;

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
      toast.success(
        `Prune erfolgreich. ${data.deletedImages.length} Images gelöscht, ${formatSize(data.spaceReclaimed)} freigegeben.`,
      );
      await fetchImages();
    } catch (error: any) {
      toast.error(`Prune fehlgeschlagen: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-mono text-sm">
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex items-center gap-2 rounded-none tracking-widest font-bold uppercase transition-none"
            onClick={() => handlePrune(false)}
            disabled={actionLoading !== null}
          >
            <HardDrive className="w-4 h-4" />
            {actionLoading === "prune"
              ? t.common.loading
              : t.images.pruneDangling}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-none border-red-900/50 text-red-500 hover:bg-red-500 hover:text-black hover:border-red-500 transition-none tracking-widest font-bold uppercase"
            onClick={() => handlePrune(true)}
            disabled={actionLoading !== null}
          >
            <AlertCircle className="w-4 h-4" />
            {t.images.pruneAll}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={fetchImages}
          disabled={loading}
          className="rounded-none tracking-widest font-bold uppercase transition-none border-zinc-800 hover:bg-zinc-800 hover:text-white"
        >
          {t.common.refresh}
        </Button>
      </div>

      <div className="border border-zinc-800 bg-black overflow-hidden font-mono text-sm">
        <Table>
          <TableHeader className="bg-zinc-950 border-b border-zinc-800">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.repository}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.tag}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.id}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.created}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.size}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase text-right">
                {t.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-zinc-500 uppercase tracking-widest"
                >
                  {t.common.loading}
                </TableCell>
              </TableRow>
            ) : images.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-zinc-500 tracking-widest uppercase"
                >
                  {t.images.noImages}
                </TableCell>
              </TableRow>
            ) : (
              images.map((img) => (
                <TableRow
                  key={img.Id}
                  className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-none group text-zinc-300"
                >
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      {img.Name}
                      {img.IsUnused && !img.IsDangling && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="flex h-2 w-2 rounded-none bg-yellow-500"></span>
                              }
                            />
                            <TooltipContent className="rounded-none border-zinc-800 bg-black font-mono text-xs font-bold uppercase tracking-widest">
                              <p>{t.images.unusedImage}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {img.IsDangling && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="flex h-2 w-2 rounded-none bg-destructive"></span>
                              }
                            />
                            <TooltipContent className="rounded-none border-zinc-800 bg-black font-mono text-xs font-bold uppercase tracking-widest">
                              <p>{t.images.danglingImage}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-1 py-0 text-[10px] font-bold tracking-widest uppercase ${img.IsDangling ? "bg-destructive/20 text-destructive" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {img.Tag}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 font-mono text-xs">
                    {img.Id.split(":")[1]?.substring(0, 12) ||
                      img.Id.substring(0, 12)}
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
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-none">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-none border-zinc-800 text-zinc-500 hover:text-black hover:bg-red-500 hover:border-red-500 transition-none"
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
