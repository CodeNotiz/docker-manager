"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, Save } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SettingsPage() {
  const { t } = useLanguage();
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
          newPassword: newPassword || undefined,
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
    <div className="flex flex-col gap-6 max-w-2xl relative font-mono mt-4">
      <div className="relative z-10 border-l-4 border-primary pl-4">
        <h1 className="text-3xl font-bold tracking-widest uppercase text-white">
          {t.settings.title}
        </h1>
        <p className="text-zinc-400 mt-1 text-xs uppercase tracking-widest">{t.settings.subtitle}</p>
      </div>

      <div className="bg-black border border-zinc-800 p-6 md:p-8 relative z-10">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm tracking-widest uppercase font-bold border-b border-zinc-800 pb-2 text-white">
              {t.settings.newUsername}
            </h2>
            <div className="space-y-2 relative">
              <Label htmlFor="newUsername" className="text-xs text-zinc-300">
                {t.settings.newUsername}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 rounded-none focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-sm tracking-widest uppercase font-bold border-b border-zinc-800 pb-2 text-white">
              {t.settings.newPassword}
            </h2>
            <div className="space-y-2 relative">
              <Label htmlFor="newPassword" className="text-xs text-zinc-300">
                {t.settings.newPassword}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 rounded-none focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-destructive border-dashed">
            <h2 className="text-sm tracking-widest uppercase font-bold text-red-500">
              {t.settings.currentPassword}
            </h2>
            <div className="space-y-2 relative">
              <Label htmlFor="currentPassword" className="text-xs text-zinc-300">
                {t.settings.currentPassword}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 bg-zinc-950 border-destructive/50 rounded-none focus-visible:ring-destructive"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="gap-2 rounded-none uppercase tracking-widest font-bold"
            >
              <Save className="w-4 h-4" />
              {loading ? t.common.loading : t.settings.saveChanges}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
