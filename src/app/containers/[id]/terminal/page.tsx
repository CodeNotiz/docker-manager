"use client";

import { useEffect, useRef, useState, use } from "react";
import { Terminal as TerminalType } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import io, { Socket } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";
import { Maximize2, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function ContainerTerminalPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const containerId = params.id;

    const [containerName, setContainerName] = useState<string>("Loading...");
    const terminalRef = useRef<HTMLDivElement>(null);
    const termInstance = useRef<TerminalType | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/containers/${containerId}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                setContainerName(data.Name.replace(/^\//, ''));
            } catch (e) {
                setContainerName(containerId.substring(0, 12));
            }
        };
        fetchDetails();
    }, [containerId]);

    useEffect(() => {
        const t = setTimeout(() => setIsMounted(true), 150);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!isMounted || !containerId || !terminalRef.current) return;

        // Initialize xterm
        const term = new TerminalType({
            cursorBlink: true,
            fontFamily: 'monospace',
            theme: {
                background: '#121212',
                foreground: '#cccccc',
                cursor: '#ffffff',
            },
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        termInstance.current = term;
        fitAddonRef.current = fitAddon;

        // Delay initial fit slightly to ensure DOM is ready
        setTimeout(() => {
            fitAddon.fit();
            term.writeln(`\x1b[1;36mConnecting to ${containerName}...\x1b[0m`);

            // Connect to our custom Socket.io server
            const socket = io({
                path: "/api/socket",
            });

            socketRef.current = socket;

            socket.on("connect", () => {
                term.writeln("\r\n\x1b[1;32m[Connected]\x1b[0m\r\n");
                socket.emit("start-terminal", { containerId, cmd: "sh" });
            });

            socket.on("output", (data: string) => {
                term.write(data);
            });

            term.onData((data) => {
                socket.emit("input", data);
            });

            socket.on("disconnect", () => {
                term.writeln("\r\n\x1b[1;31m[Disconnected from server]\x1b[0m\r\n");
            });
        }, 100);

        const handleResize = () => {
            if (fitAddonRef.current) {
                fitAddonRef.current.fit();
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            term.dispose();
            termInstance.current = null;
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isMounted, containerId, containerName]);

    // Re-fit terminal when fullscreen state changes
    useEffect(() => {
        if (fitAddonRef.current) {
            // Need a slight delay to allow CSS transition to finish updating container size
            const timer = setTimeout(() => {
                fitAddonRef.current?.fit();
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [isFullscreen]);

    return (
        <div className={`flex flex-col gap-0 bg-[#121212] overflow-hidden transition-all duration-200 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-12rem)] rounded-xl border border-zinc-800 shadow-2xl'}`}>
            {/* Window Header */}
            <div className="flex flex-row items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 select-none m-0 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href={`/containers/${containerId}`} passHref>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 mr-2">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex gap-1.5 mr-4 opacity-50 hover:opacity-100 transition-opacity">
                        <Link href={`/containers/${containerId}`}>
                            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" />
                        </Link>
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)} />
                    </div>
                    <h1 className="text-zinc-400 text-xs font-mono font-normal">
                        root@{containerName}: /
                    </h1>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Link href={`/containers/${containerId}`} passHref>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-red-500/20">
                            <X className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 w-full relative bg-[#121212]">
                {isMounted && (
                    <div className="absolute inset-0 p-3" ref={terminalRef}></div>
                )}
            </div>
        </div>
    );
}
