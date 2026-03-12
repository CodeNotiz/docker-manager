"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Play, Square, Edit, Layers } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor from "@monaco-editor/react";

interface DockerStack {
  name: string;
  composeFile: string;
  envFile?: string;
  status: "running" | "stopped" | "unknown";
  containers: number;
}

export function StackList() {
  const { t } = useLanguage();
  const [stacks, setStacks] = useState<DockerStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Editor Dialog State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [currentStackName, setCurrentStackName] = useState("");
  const [currentComposeContent, setCurrentComposeContent] = useState(
    "version: '3.8'\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"8080:80\"\n",
  );
  const [currentEnvContent, setCurrentEnvContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchStacks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stacks");
      if (!res.ok) throw new Error("Fehler beim Laden der Stacks");
      const data = await res.json();
      setStacks(data);
    } catch (error) {
      toast.error("Stacks konnten nicht geladen werden.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, []);

  const openCreateEditor = () => {
    setEditorMode("create");
    setCurrentStackName("");
    setCurrentComposeContent(
      'services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8080:80"\n',
    );
    setCurrentEnvContent("");
    setIsEditorOpen(true);
  };

  const openEditEditor = (stack: DockerStack) => {
    setEditorMode("edit");
    setCurrentStackName(stack.name);
    setCurrentComposeContent(stack.composeFile);
    setCurrentEnvContent(stack.envFile || "");
    setIsEditorOpen(true);
  };

  const handleSaveStack = async (
    deployAfter: boolean = false,
    e?: React.FormEvent,
  ) => {
    if (e) e.preventDefault();

    if (!currentStackName.trim()) {
      toast.error("Der Stack-Name darf nicht leer sein.");
      return;
    }

    if (!currentComposeContent.trim()) {
      toast.error("Die docker-compose.yml darf nicht leer sein.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentStackName,
          composeFile: currentComposeContent,
          envFile: currentEnvContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Stack konnte nicht gespeichert werden");
      }

      toast.success(`Stack "${currentStackName}" gespeichert.`);
      setIsEditorOpen(false);
      await fetchStacks();

      if (deployAfter) {
        handleAction(currentStackName, "up");
      }
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (
      !confirm(
        `WARNUNG: Möchtest du den Stack "${name}" wirklich löschen? Dies stoppt und entfernt alle zugehörigen Container.`,
      )
    )
      return;

    setActionLoading(`delete-${name}`);
    try {
      const res = await fetch(`/api/stacks/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Löschen fehlgeschlagen");
      }

      toast.success(`Stack "${name}" gelöscht`);
      await fetchStacks();
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (name: string, action: "up" | "down") => {
    setActionLoading(`${action}-${name}`);
    toast.info(
      `Führe "docker compose ${action}" für ${name} aus. Das kann einige Sekunden dauern...`,
    );
    try {
      const res = await fetch(`/api/stacks/${encodeURIComponent(name)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Aktion ${action} fehlgeschlagen`);
      }

      toast.success(
        `Stack "${name}" erfolgreich ${action === "up" ? "gestartet" : "gestoppt"}`,
      );
      await fetchStacks();
    } catch (error: any) {
      toast.error(`Fehler bei Compose ${action}:\n${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      <div className="flex bg-black p-5 rounded-none flex-col gap-4 border border-zinc-800 shadow-none">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t.stacks.title}
            </h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              {t.stacks.subtitle}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchStacks}
              variant="outline"
              disabled={loading}
              className="rounded-none tracking-widest font-bold uppercase transition-none border-zinc-800 hover:bg-zinc-800 hover:text-white"
            >
              {t.common.refresh}
            </Button>
            <Button
              onClick={openCreateEditor}
              className="gap-2 rounded-none tracking-widest font-bold uppercase transition-none"
            >
              <Plus className="w-4 h-4" />
              {t.stacks.createStack}
            </Button>
          </div>
        </div>

        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col bg-black border border-zinc-800 rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="font-bold tracking-widest uppercase">
                {editorMode === "create" ? t.stacks.createStack : t.common.edit}
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Schreibe oder paste hier deine{" "}
                <code className="text-primary bg-primary/10 px-1 py-0.5">
                  docker-compose.yml
                </code>{" "}
                Konfiguration.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4 flex-1 min-h-0">
              <div className="flex items-center gap-4">
                <Label
                  htmlFor="name"
                  className="whitespace-nowrap w-24 font-bold uppercase tracking-widest text-zinc-400"
                >
                  Stack {t.common.name}
                </Label>
                <Input
                  id="name"
                  value={currentStackName}
                  onChange={(e) => setCurrentStackName(e.target.value)}
                  placeholder="e.g. my-wordpress-stack"
                  disabled={editorMode === "edit"}
                  className="flex-1 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex-1 overflow-hidden relative border border-zinc-800">
                <Tabs
                  defaultValue="compose"
                  className="w-full h-full flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-none bg-black border-b border-zinc-800 h-10 p-0">
                    <TabsTrigger
                      value="compose"
                      className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none font-bold uppercase tracking-widest text-xs h-full"
                    >
                      docker-compose.yml
                    </TabsTrigger>
                    <TabsTrigger
                      value="env"
                      className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none font-bold uppercase tracking-widest text-xs h-full"
                    >
                      .env Variables
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="compose"
                    className="flex-1 mt-0 outline-none"
                  >
                    <Editor
                      height="100%"
                      defaultLanguage="yaml"
                      theme="vs-dark"
                      value={currentComposeContent}
                      onChange={(val) => setCurrentComposeContent(val || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="env" className="flex-1 mt-0 outline-none">
                    <Editor
                      height="100%"
                      defaultLanguage="shell"
                      theme="vs-dark"
                      value={currentEnvContent}
                      onChange={(val) => setCurrentEnvContent(val || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-none transition-none border-zinc-800 hover:bg-zinc-800 hover:text-white uppercase tracking-widest font-bold"
              >
                {t.common.cancel}
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleSaveStack(false)}
                  disabled={isSaving}
                  className="rounded-none transition-none uppercase tracking-widest font-bold bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  {isSaving ? t.common.loading : t.common.save}
                </Button>
                <Button
                  onClick={() => handleSaveStack(true)}
                  disabled={isSaving}
                  className="rounded-none transition-none uppercase tracking-widest font-bold hover:bg-primary hover:text-black"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isSaving ? t.common.loading : t.stacks.deploy}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-zinc-500 font-bold uppercase tracking-widest">
            {t.common.loading}
          </div>
        ) : stacks.length === 0 ? (
          <div className="col-span-full border border-dashed rounded-none border-zinc-800 p-12 text-center bg-black">
            <Layers className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
            <h3 className="text-lg font-bold uppercase tracking-widest mb-2">
              {t.stacks.noStacks}
            </h3>
            <p className="text-zinc-500 mb-6 uppercase tracking-widest text-xs">
              {t.stacks.emptyStateDesc}
            </p>
            <Button
              onClick={openCreateEditor}
              className="rounded-none transition-none uppercase tracking-widest font-bold"
            >
              {t.stacks.createStack}
            </Button>
          </div>
        ) : (
          stacks.map((stack) => (
            <div
              key={stack.name}
              className="flex flex-col bg-black border border-zinc-800 rounded-none overflow-hidden group text-zinc-300"
            >
              <div className="p-5 border-b border-zinc-800 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1">{stack.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${stack.status === "running" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-none mr-1.5 ${stack.status === "running" ? "bg-primary animate-pulse" : "bg-destructive"}`}
                      ></span>
                      {stack.status === "running" ? "Running" : "Stopped"}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1 font-bold uppercase tracking-widest">
                      {stack.containers} Container
                    </span>
                  </div>
                </div>
                <div className="flex gap-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-none">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-none border-zinc-800 text-zinc-500 hover:bg-blue-500 hover:text-black hover:border-blue-500 transition-none"
                    onClick={() => openEditEditor(stack)}
                    title={t.common.edit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-none border-zinc-800 text-zinc-500 hover:bg-red-500 hover:text-black hover:border-red-500 transition-none"
                    onClick={() => handleDelete(stack.name)}
                    disabled={actionLoading === `delete-${stack.name}`}
                    title={t.common.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-zinc-950 px-5 py-4 flex gap-2 justify-end mt-auto border-t border-zinc-800">
                <Button
                  variant={stack.status === "running" ? "outline" : "default"}
                  className={`rounded-none tracking-widest font-bold uppercase transition-none ${stack.status === "running" ? "border-zinc-800 text-zinc-600 hover:bg-transparent hover:text-zinc-600" : "hover:bg-primary hover:text-black"}`}
                  disabled={
                    stack.status === "running" ||
                    actionLoading === `up-${stack.name}`
                  }
                  onClick={() => handleAction(stack.name, "up")}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t.stacks.deploy}
                </Button>
                <Button
                  variant={stack.status === "stopped" ? "outline" : "default"}
                  className={`rounded-none tracking-widest font-bold uppercase transition-none ${stack.status === "stopped" ? "border-zinc-800 text-zinc-600 hover:bg-transparent hover:text-zinc-600" : "bg-destructive text-white hover:bg-red-700"}`}
                  disabled={
                    stack.status === "stopped" ||
                    actionLoading === `down-${stack.name}`
                  }
                  onClick={() => handleAction(stack.name, "down")}
                >
                  <Square className="w-4 h-4 mr-2" />
                  {t.stacks.stop}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
