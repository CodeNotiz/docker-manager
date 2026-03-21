"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LayoutTemplate, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface Template {
    id: string;
    name: string;
    description: string;
    logo: string;
    compose: string;
}

export function TemplateList() {
    const { t } = useLanguage();
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    // Deployment Dialog State
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [stackName, setStackName] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        fetch("/api/templates")
            .then(res => res.json())
            .then(data => {
                setTemplates(data);
                setLoading(false);
            })
            .catch(err => {
                toast.error("Fehler beim Laden der Templates");
                setLoading(false);
            });
    }, []);

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stackName.trim() || !selectedTemplate) return;

        setIsDeploying(true);
        try {
            // 1. Stack erstellen (Wiederverwendung deiner bestehenden Stacks-API)
            const res = await fetch("/api/stacks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: stackName.toLowerCase().replace(/\s+/g, '-'),
                    composeFile: selectedTemplate.compose,
                }),
            });

            if (!res.ok) throw new Error("Fehler beim Speichern des Stacks");

            // 2. Stack starten (docker compose up)
            const upRes = await fetch(`/api/stacks/${encodeURIComponent(stackName.toLowerCase().replace(/\s+/g, '-'))}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "up" }),
            });

            if (!upRes.ok) throw new Error("Fehler beim Starten des Stacks");

            toast.success(t.templates?.success || "Template erfolgreich bereitgestellt!");
            setSelectedTemplate(null);
            router.push("/stacks"); // Leite den User zu den Stacks weiter

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeploying(false);
        }
    };

    if (loading) return <div>{t.common.loading}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map(template => (
                <Card key={template.id} className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-white/20 dark:border-zinc-800/50 hover:shadow-xl transition-all flex flex-col">
                    <CardHeader className="flex-row gap-4 items-center">
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm p-2 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={template.logo} alt={template.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{template.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <CardDescription className="text-zinc-600 dark:text-zinc-400 line-clamp-3">
                            {template.description}
                        </CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                setSelectedTemplate(template);
                                setStackName(template.id);
                            }}
                        >
                            <LayoutTemplate className="w-4 h-4 mr-2" />
                            {t.templates?.deploy || "Deploy"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
                <DialogContent>
                    <form onSubmit={handleDeploy}>
                        <DialogHeader>
                            <DialogTitle>{t.templates?.deployTitle || "Template bereitstellen"}: {selectedTemplate?.name}</DialogTitle>
                            <DialogDescription>
                                {t.templates?.deployDesc || "Gib einen Namen für diesen Stack ein."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <Label htmlFor="stackName">{t.templates?.stackName || "Stack Name"}</Label>
                            <Input
                                id="stackName"
                                value={stackName}
                                onChange={(e) => setStackName(e.target.value)}
                                className="mt-2"
                                placeholder="z.B. my-nginx"
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSelectedTemplate(null)}>
                                {t.common.cancel}
                            </Button>
                            <Button type="submit" disabled={isDeploying} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isDeploying ? (
                                    t.common.loading
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        {t.templates?.deploy || "Deploy"}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}