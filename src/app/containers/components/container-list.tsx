"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Terminal,
  FileText,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { ContainerInfo } from "dockerode";

import Link from "next/link";

export function ContainerList() {
  const { t, locale } = useLanguage();
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetch(`/api/containers/${id}/${action}`, { method: "POST" }).then(
        async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `Aktion ${action} fehlgeschlagen`);
          }
          return res.json();
        },
      ),
      {
        loading: `Führe ${action} aus...`,
        success: (data) => {
          fetchContainers();
          return data.message;
        },
        error: (err) => err.message,
      },
    );
  };

  if (loading) return <div>{t.common.loading}</div>;

  return (
    <>
      <div className="border border-zinc-800 bg-black overflow-hidden font-mono text-sm">
        <Table>
          <TableHeader className="bg-zinc-950 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.common.name}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.containers.state}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.containers.image}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.containers.ports}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.created}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase text-right">
                {t.common.actions}
              </TableHead>
              <TableHead className="text-right">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.map((container) => {
              const name = container.Names[0].replace(/^\//, "");
              const isRunning = container.State === "running";
              const isPaused = container.State === "paused";

              return (
                <TableRow
                  key={container.Id}
                  className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-none text-zinc-300"
                >
                  <TableCell className="font-bold">
                    <Link
                      href={`/containers/${container.Id}`}
                      className="hover:bg-primary hover:text-black hover:no-underline px-1 py-0.5 transition-none text-left"
                    >
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isRunning ? "default" : "secondary"}
                      className={`rounded-none uppercase tracking-widest text-[10px] px-2 py-0 border-none ${isRunning ? "bg-primary text-black" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {container.State}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={container.Image}
                  >
                    {container.Image}
                  </TableCell>
                  <TableCell>
                    {Array.from(
                      new Set(
                        container.Ports.filter((p) => p.PublicPort).map(
                          (p) => p.PublicPort,
                        ),
                      ),
                    ).map((port, i, arr) => (
                      <span key={port}>
                        <a
                          href={`http://${window.location.hostname}:${port}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:bg-accent hover:text-black px-1 transition-none"
                        >
                          {port}:
                          {
                            container.Ports.find((p) => p.PublicPort === port)
                              ?.PrivatePort
                          }
                        </a>
                        {i < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    {container.Ports.filter((p) => p.PublicPort).length === 0 &&
                      "-"}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(container.Created * 1000), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isRunning ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-none"
                            onClick={() => handleAction(container.Id, "pause")}
                            title={t.containers.pause}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-red-500 hover:text-black hover:border-red-500 transition-none"
                            onClick={() => handleAction(container.Id, "stop")}
                            title={t.containers.stop}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      ) : isPaused ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-green-500 hover:text-black hover:border-green-500 transition-none"
                            onClick={() =>
                              handleAction(container.Id, "unpause")
                            }
                            title={t.containers.resume}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-none border-zinc-700 hover:bg-destructive hover:text-white hover:border-destructive transition-none"
                            onClick={() => handleAction(container.Id, "stop")}
                            title={t.containers.stop}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-green-500 hover:text-black hover:border-green-500 transition-none"
                          onClick={() => handleAction(container.Id, "start")}
                          title={t.containers.start}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-blue-500 hover:text-black hover:border-blue-500 transition-none"
                        onClick={() => handleAction(container.Id, "restart")}
                        title={t.containers.restart}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-red-500 hover:text-black hover:border-red-500 transition-none"
                        onClick={() => handleAction(container.Id, "delete")}
                        title={t.containers.remove}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-8 bg-zinc-800 mx-1"></div>
                      <Link href={`/containers/${container.Id}/logs`} passHref>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-none"
                          title={t.containers.logs}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link
                        href={`/containers/${container.Id}/terminal`}
                        className={
                          !isRunning ? "pointer-events-none opacity-50" : ""
                        }
                        passHref
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-none border-zinc-800 text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-none"
                          title={t.containers.terminal}
                          disabled={!isRunning}
                        >
                          <Terminal className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {containers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  {t.containers.noContainers}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
