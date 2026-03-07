"use client";

import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Terminal as TerminalType } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import io, { Socket } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContainerTerminalProps {
    containerId: string | null;
    containerName: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContainerTerminal({ containerId, containerName, isOpen, onOpenChange }: ContainerTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termInstance = useRef<TerminalType | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setIsMounted(true), 300);
            return () => clearTimeout(t);
        } else {
            setIsMounted(false);
            setIsFullscreen(false);
        }
    }, [isOpen]);

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
    }, [isMounted, containerId]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={`bg-[#121212] border-zinc-800 p-0 overflow-hidden flex flex-col gap-0 transition-all duration-200 ${isFullscreen ? 'max-w-[100vw] sm:max-w-[100vw] w-screen h-screen rounded-none' : 'max-w-[1280px] sm:max-w-[1280px] w-[1280px] h-[720px]'}`}>
                {/* Terminal Header Bar (Mac-like or generic window) */}
                <DialogHeader className="flex flex-row items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none m-0">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 mr-4">
                            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" onClick={() => onOpenChange(false)} />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)} />
                        </div>
                        <DialogTitle className="text-zinc-400 text-xs font-mono font-normal">
                            root@{containerName}: /
                        </DialogTitle>
                        <DialogDescription className="sr-only">Interaktives Terminal</DialogDescription>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => setIsFullscreen(!isFullscreen)}>
                            <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-red-500/20" onClick={() => onOpenChange(false)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 w-full relative bg-[#121212]">
                    {isMounted && (
                        <div className="absolute inset-0 p-3" ref={terminalRef}></div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
