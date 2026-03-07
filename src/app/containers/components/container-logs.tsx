"use client";

import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Maximize2, X } from "lucide-react";

interface ContainerLogsProps {
    containerId: string | null;
    containerName: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContainerLogs({ containerId, containerName, isOpen, onOpenChange }: ContainerLogsProps) {
    const [logs, setLogs] = useState<string>("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setIsFullscreen(false);
            return;
        }

        let abortController: AbortController = new AbortController();

        const fetchLogs = async () => {
            if (!containerId) return;
            setLogs("");

            try {
                const response = await fetch(`/api/containers/${containerId}/logs`, {
                    signal: abortController.signal
                });

                if (!response.body) return;

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    setLogs((prev) => prev + decoder.decode(value, { stream: true }));

                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
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
    }, [containerId, isOpen]);

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
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={`bg-[#121212] border-zinc-800 p-0 overflow-hidden flex flex-col gap-0 transition-all duration-200 ${isFullscreen ? 'max-w-[100vw] sm:max-w-[100vw] w-screen h-screen rounded-none' : 'max-w-[1280px] sm:max-w-[1280px] w-[1280px] h-[720px]'}`}>
                {/* Window Header */}
                <DialogHeader className="flex flex-row items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none m-0">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 mr-4 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" onClick={() => onOpenChange(false)} />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)} />
                        </div>
                        <DialogTitle className="text-zinc-300 text-sm font-medium">
                            Logs: {containerName}
                        </DialogTitle>
                        <DialogDescription className="sr-only">Live Stream der Container-Ausgabe</DialogDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-400 hover:text-white" onClick={() => setLogs("")}>
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Clear
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-400 hover:text-white" onClick={downloadLogs}>
                            <Download className="w-3 h-3 mr-1.5" />
                            Download
                        </Button>
                        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => setIsFullscreen(!isFullscreen)}>
                            <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-red-500/20" onClick={() => onOpenChange(false)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 w-full relative bg-[#121212] flex overflow-hidden">
                    <ScrollArea className="flex-1 w-full h-full p-4 [&>div>div]:min-h-full" ref={scrollRef}>
                        <pre className="whitespace-pre-wrap word-break-all font-mono text-sm leading-tight text-green-400">
                            {logs || "Warte auf Logs..."}
                        </pre>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
