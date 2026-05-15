"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Database } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DockerVolume {
  Name: string;
  Driver: string;
  Mountpoint: string;
  Scope: string;
  CreatedAt: string;
}

export function VolumeList() {
  const { t } = useLanguage();
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newVolumeName, setNewVolumeName] = useState("");
  const [newVolumeDriver, setNewVolumeDriver] = useState("local");
  const [isCreating, setIsCreating] = useState(false);

  const fetchVolumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/volumes");
      if (!res.ok) throw new Error(t.volumes.fetchError);
      const data: DockerVolume[] = await res.json();
      setVolumes(data);
    } catch {
      toast.error(t.volumes.toastError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(t.volumes.removeAsk)) return;
    setActionLoading(name);
    try {
      const res = await fetch(`/api/volumes/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || t.volumes.removeError);
      }
      toast.success(t.volumes.removeSuccess);
      await fetchVolumes();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`${t.volumes.error}: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateVolume = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newVolumeName.trim()) {
      toast.error(t.volumes.createEmpty);
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/volumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: newVolumeName, Driver: newVolumeDriver }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || t.volumes.createError);
      }
      const successMsg = t.volumes.createSuccess.replace("{volname}", newVolumeName);
      toast.success(successMsg);
      setIsCreateOpen(false);
      setNewVolumeName("");
      setNewVolumeDriver("local");
      await fetchVolumes();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`${t.volumes.error}: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t.common.loading}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div></div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            {t.volumes.create}
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t.volumes.createDialog.title}</DialogTitle>
              <DialogDescription>{t.volumes.createDialog.desc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateVolume} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.common.name}</Label>
                <Input
                  id="name"
                  placeholder={t.volumes.createVolume}
                  value={newVolumeName}
                  onChange={(e) => setNewVolumeName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driver">{t.volumes.createDialog.selectDriver}</Label>
                <Select value={newVolumeDriver} onValueChange={(value: string | null) => {
                  if (value) setNewVolumeDriver(value);
                }}>
                  <SelectTrigger id="driver">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">local</SelectItem>
                    <SelectItem value="nfs">nfs</SelectItem>
                    <SelectItem value="tmpfs">tmpfs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? t.common.loading : t.volumes.create}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {volumes.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500">{t.volumes.noVolumes}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/30 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead>{t.common.name}</TableHead>
                <TableHead>{t.volumes.driver}</TableHead>
                <TableHead>{t.volumes.scope}</TableHead>
                <TableHead>{t.volumes.mountpoint}</TableHead>
                <TableHead className="text-right">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volumes.map((volume) => (
                <TableRow key={volume.Name} className="border-zinc-200 dark:border-zinc-800 group">
                  <TableCell className="font-medium">{volume.Name}</TableCell>
                  <TableCell>{volume.Driver}</TableCell>
                  <TableCell>{volume.Scope}</TableCell>
                  <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                    {volume.Mountpoint}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(volume.Name)}
                      disabled={actionLoading === volume.Name}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
