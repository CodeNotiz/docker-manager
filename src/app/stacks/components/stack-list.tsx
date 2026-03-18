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
    status: 'running' | 'stopped' | 'unknown';
    containers: number;
}

export function StackList() {
    const { t } = useLanguage();
    const [stacks, setStacks] = useState<DockerStack[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Editor Dialog State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [currentStackName, setCurrentStackName] = useState("");
    const [currentComposeContent, setCurrentComposeContent] = useState("version: '3.8'\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"8080:80\"\n");
    const [currentEnvContent, setCurrentEnvContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchStacks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stacks");
            if (!res.ok) throw new Error(t.stacks.fetchError);
            const data = await res.json();
            setStacks(data);
        } catch (error) {
            toast.error(t.stacks.toastError);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStacks();
    }, []);

    const openCreateEditor = () => {
        setEditorMode('create');
        setCurrentStackName("");
        setCurrentComposeContent("services:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"8080:80\"\n");
        setCurrentEnvContent("");
        setIsEditorOpen(true);
    };

    const openEditEditor = (stack: DockerStack) => {
        setEditorMode('edit');
        setCurrentStackName(stack.name);
        setCurrentComposeContent(stack.composeFile);
        setCurrentEnvContent(stack.envFile || "");
        setIsEditorOpen(true);
    };

    const handleSaveStack = async (deployAfter: boolean = false, e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!currentStackName.trim()) {
            toast.error(t.stacks.createNew.nameEmpty);
            return;
        }

        if (!currentComposeContent.trim()) {
            toast.error(t.stacks.createNew.ymlEmpty);
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
                throw new Error(data.error || t.stacks.createNew.saveError);
            }

            const successMsg = t.stacks.createNew.saveSuccess
                .replace("{newStackName}", currentStackName);
            toast.success(successMsg);
            setIsEditorOpen(false);
            await fetchStacks();

            if (deployAfter) {
                handleAction(currentStackName, 'up');
            }
        } catch (error: any) {
            toast.error(`${t.stacks.error}: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (name: string) => {
        const removeQuestion = t.stacks.remove.question
            .replace("{name}", name);
        if (!confirm(removeQuestion)) return;

        setActionLoading(`delete-${name}`);
        try {
            const res = await fetch(`/api/stacks/${encodeURIComponent(name)}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || t.stacks.remove.error);
            }
            const successMsg = t.stacks.remove.success
                .replace("{name}", name);
            toast.success(successMsg);
            await fetchStacks();
        } catch (error: any) {
            toast.error(`${t.stacks.error}: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAction = async (name: string, action: 'up' | 'down') => {
        setActionLoading(`${action}-${name}`);
        const actionMsg = t.stacks.doaction.massage
            .replace("{action}", action)
            .replace("{name}", name);
        toast.info(actionMsg);
        try {
            const res = await fetch(`/api/stacks/${encodeURIComponent(name)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) {
                const data = await res.json();
                const errorMsg = t.stacks.doaction.goesWrong
                    .replace("{action}", action);
                throw new Error(data.error || errorMsg);
            }

            const statusText = action === 'up' ? t.stacks.doaction.started : t.stacks.doaction.stopped;
            const successMsg = t.stacks.doaction.success
                .replace("{name}", name)
                .replace("{status}", statusText);
            toast.success(successMsg);
            await fetchStacks();
        } catch (error: any) {
            const errorMassage = t.stacks.doaction.errorMsg
                .replace("{action}", action)
                .replace("{error.massage}", error.massage);
            toast.error(errorMassage);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl flex-col gap-4 border border-white/20 dark:border-zinc-800/50 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            {t.stacks.title}
                        </h3>
                        <p className="text-sm text-zinc-500">
                            {t.stacks.subtitle}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={fetchStacks} variant="outline" disabled={loading}>{t.common.refresh}</Button>
                        <Button onClick={openCreateEditor} className="gap-2">
                            <Plus className="w-4 h-4" />
                            {t.stacks.createStack}
                        </Button>
                    </div>
                </div>

                <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{editorMode === 'create' ? t.stacks.createStack : t.common.edit}</DialogTitle>
                            <DialogDescription dangerouslySetInnerHTML={{ __html: t.stacks.createNew.description }} />
                        </DialogHeader>

                        <div className="flex flex-col gap-4 py-4 flex-1 min-h-0">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="name" className="whitespace-nowrap w-24">
                                    Stack {t.common.name}
                                </Label>
                                <Input
                                    id="name"
                                    value={currentStackName}
                                    onChange={(e) => setCurrentStackName(e.target.value)}
                                    placeholder={t.common.eg + " my-wordpress-stack"}
                                    disabled={editorMode === 'edit'}
                                    className="flex-1"
                                    required
                                />
                            </div>

                            <div className="flex-1 overflow-hidden relative border-t border-zinc-200 dark:border-zinc-800">
                                <Tabs defaultValue="compose" className="w-full h-full flex flex-col">
                                    <TabsList className="grid w-full grid-cols-2 rounded-none bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                        <TabsTrigger value="compose">docker-compose.yml</TabsTrigger>
                                        <TabsTrigger value="env">.env Variables</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="compose" className="flex-1 mt-0 outline-none">
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
                            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>{t.common.cancel}</Button>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button variant="secondary" onClick={() => handleSaveStack(false)} disabled={isSaving}>
                                    {isSaving ? t.common.loading : t.common.save}
                                </Button>
                                <Button onClick={() => handleSaveStack(true)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                    <div className="col-span-full text-center py-12 text-zinc-500">{t.common.loading}</div>
                ) : stacks.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed rounded-lg border-zinc-300 dark:border-zinc-800 p-12 text-center">
                        <Layers className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t.stacks.noStacks}</h3>
                        <p className="text-zinc-500 mb-4">{t.stacks.emptyStateDesc}</p>
                        <Button onClick={openCreateEditor}>{t.stacks.createStack}</Button>
                    </div>
                ) : (
                    stacks.map((stack) => (
                        <div key={stack.name} className="flex flex-col bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{stack.name}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stack.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stack.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {stack.status === 'running' ? 'Running' : 'Stopped'}
                                        </span>
                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                            {stack.containers} Container
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openEditEditor(stack)}
                                        title={t.common.edit}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        onClick={() => handleDelete(stack.name)}
                                        disabled={actionLoading === `delete-${stack.name}`}
                                        title={t.common.delete}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white/40 dark:bg-zinc-900/40 border-t border-white/10 dark:border-zinc-800/50 px-5 py-4 flex gap-2 justify-end mt-auto backdrop-blur-md">
                                <Button
                                    variant={stack.status === 'running' ? 'outline' : 'default'}
                                    className={stack.status === 'running' ? 'text-zinc-500' : 'bg-green-600 hover:bg-green-700 text-white'}
                                    disabled={stack.status === 'running' || actionLoading === `up-${stack.name}`}
                                    onClick={() => handleAction(stack.name, 'up')}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {t.stacks.deploy}
                                </Button>
                                <Button
                                    variant={stack.status === 'stopped' ? 'outline' : 'default'}
                                    className={stack.status === 'stopped' ? 'text-zinc-500' : 'bg-red-600 hover:bg-red-700 text-write dark:text-white'}
                                    disabled={stack.status === 'stopped' || actionLoading === `down-${stack.name}`}
                                    onClick={() => handleAction(stack.name, 'down')}
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
