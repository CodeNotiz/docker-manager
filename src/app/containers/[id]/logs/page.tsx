"use client";

import { useEffect, useRef, useState, use } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Maximize2, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { useLanguage } from "@/i18n/LanguageContext";

export default function ContainerLogsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const containerId = params.id;
  const { t } = useLanguage();

  const [containerName, setContainerName] = useState<string>("Loading...");
  const [logs, setLogs] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch container details first to get the name
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/containers/${containerId}`);
        if (!res.ok) throw new Error(t.logs.fetchError);
        const data = await res.json();
        setContainerName(data.Name.replace(/^\//, ""));
      } catch (e) {
        setContainerName(containerId.substring(0, 12));
      }
    };
    fetchDetails();
  }, [containerId]);

  // Fetch logs stream
  useEffect(() => {
    let abortController: AbortController = new AbortController();

    const fetchLogs = async () => {
      setLogs("");

      try {
        const response = await fetch(`/api/containers/${containerId}/logs`, {
          signal: abortController.signal,
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          setLogs((prev) => prev + decoder.decode(value, { stream: true }));
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching logs:", error);
          setLogs((prev) => prev + `\n[Error fetching logs: ${error.message}]`);
        }
      }
    };

    fetchLogs();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [containerId]);

  // Auto-scroll when logs change
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [logs]);

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${containerName || containerId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col gap-0 bg-[#121212] overflow-hidden transition-all duration-200 ${isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-12rem)] rounded-xl border border-zinc-800 shadow-2xl"}`}
    >
      {/* Window Header */}
      <div className="flex flex-row items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 select-none m-0 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/containers" passHref>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex gap-1.5 mr-4 opacity-50 hover:opacity-100 transition-opacity">
            <Link href="/containers">
              <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" />
            </Link>
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer"
              onClick={() => setIsFullscreen(!isFullscreen)}
            />
          </div>
          <h1 className="text-zinc-300 text-sm font-medium">
            {t.logs.title}{containerName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-zinc-400 hover:text-white"
            onClick={() => setLogs("")}
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            {t.logs.clear}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-zinc-400 hover:text-white"
            onClick={downloadLogs}
          >
            <Download className="w-3 h-3 mr-1.5" />
            {t.logs.download}
          </Button>
          <div className="w-px h-4 bg-zinc-700 mx-1"></div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Link href={`/containers/${containerId}`} passHref>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-red-500/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <div
        className="flex-1 w-full relative bg-[#121212] flex overflow-hidden"
        ref={scrollRef}
      >
        <ScrollArea className="flex-1 w-full h-full p-4 [&>div>div]:min-h-full">
          <pre className="whitespace-pre-wrap word-break-all font-mono text-sm leading-tight text-green-400">
            {logs || t.logs.waiting}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
}
