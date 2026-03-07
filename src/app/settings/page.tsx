"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, Save } from "lucide-react";

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error("Das aktuelle Passwort wird zur Bestätigung benötigt.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newUsername: newUsername || undefined,
                    newPassword: newPassword || undefined
                }),
            });

            if (res.ok) {
                toast.success("Zugangsdaten erfolgreich aktualisiert!");
                setCurrentPassword("");
                setNewPassword("");
                setNewUsername("");
            } else {
                const data = await res.json();
                toast.error(data.error || "Speichern fehlgeschlagen.");
            }
        } catch (error) {
            toast.error("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl relative">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
                <p className="text-muted-foreground">Passe hier deine Zugangsdaten für den Docker Manager an.</p>
            </div>

            <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-lg relative z-10">
                <form onSubmit={handleSave} className="space-y-6">

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Neuer Benutzername</h2>
                        <div className="space-y-2 relative">
                            <Label htmlFor="newUsername">Optional: Neuen Benutzernamen vergeben</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    id="newUsername"
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="Lass das Feld leer, um ihn nicht zu ändern"
                                    className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Neues Passwort</h2>
                        <div className="space-y-2 relative">
                            <Label htmlFor="newPassword">Optional: Neues Passwort vergeben</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Lass das Feld leer, um es nicht zu ändern"
                                    className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 mt-6 border-t border-red-500/20">
                        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Bestätigung erforderlich</h2>
                        <div className="space-y-2 relative">
                            <Label htmlFor="currentPassword">Aktuelles Passwort (Pflichtfeld)</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Dein derzeitiges Passwort"
                                    className="pl-10 bg-white/50 dark:bg-zinc-900/50 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500"
                                    required
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Aus Sicherheitsgründen musst du dein aktuelles Passwort eingeben, um Änderungen zu speichern.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} className="gap-2">
                            <Save className="w-4 h-4" />
                            {loading ? "Speichere..." : "Änderungen speichern"}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
