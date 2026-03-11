"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Trash2, Pause } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ContainerActions({ id, isRunning, isPaused }: { id: string, isRunning: boolean, isPaused: boolean }) {
    const { t } = useLanguage();
    const router = useRouter();

    const handleAction = async (action: string) => {
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
                    if (action === 'delete') {
                        router.push('/containers');
                    } else {
                        router.refresh();
                    }
                    return data.message;
                },
                error: (err) => err.message,
            }
        );
    };

    return (
        <div className="flex flex-col gap-2">
            {isRunning ? (
                <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleAction('pause')} title={t.containers.pause}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausieren
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleAction('stop')} title={t.containers.stop}>
                        <Square className="h-4 w-4 mr-2" />
                        Stoppen
                    </Button>
                </>
            ) : isPaused ? (
                <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleAction('unpause')} title={t.containers.resume}>
                        <Play className="h-4 w-4 mr-2" />
                        Fortsetzen
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleAction('stop')} title={t.containers.stop}>
                        <Square className="h-4 w-4 mr-2" />
                        Stoppen
                    </Button>
                </>
            ) : (
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAction('start')} title={t.containers.start}>
                    <Play className="h-4 w-4 mr-2" />
                    Starten
                </Button>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={() => handleAction('restart')} title={t.containers.restart}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Neustart
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={() => handleAction('delete')} title={t.containers.remove}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
            </Button>
        </div>
    );
}
