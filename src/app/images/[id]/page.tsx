"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Cpu, Globe, Terminal, Layers } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImageDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetch(`/api/images/${id}`)
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-8">{t.images.detail.loading}</div>;
    if (!data) return <div className="p-8">{t.images.detail.notFound}</div>;

    const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + " MB";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/images" passHref>
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.images.detail.title}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Sektion: Basis Informationen */}
                <Card>
                    <CardHeader className="flex flex-row items-center space-x-2">
                        <HardDrive className="h-5 w-5" />
                        <CardTitle>{t.images.detail.general}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.id}</TableCell>
                                    <TableCell>{data.Id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.repositoryTags}</TableCell>
                                    <TableCell>{data.RepoTags?.join(", ") || "<none>"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.size}</TableCell>
                                    <TableCell>{formatSize(data.Size)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.created}</TableCell>
                                    <TableCell>{new Date(data.Created).toLocaleString()}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.architecture}</TableCell>
                                    <TableCell><Badge variant="secondary">{data.Architecture} / {data.Os}</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Sektion: Konfiguration & Ports */}
                <Card>
                    <CardHeader className="flex flex-row items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <CardTitle>{t.images.detail.networkPorts}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.exposedPorts}</TableCell>
                                    <TableCell>
                                        {data.Config.ExposedPorts
                                            ? Object.keys(data.Config.ExposedPorts).map(port => (
                                                <Badge key={port} className="mr-1">{port}</Badge>
                                            ))
                                            : "Keine"}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.workingDir}</TableCell>
                                    <TableCell className="font-mono text-xs">{data.Config.WorkingDir}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">{t.images.detail.entrypoint}</TableCell>
                                    <TableCell className="font-mono text-xs italic">
                                        {data.Config.Entrypoint?.join(" ") || "N/A"}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Sektion: Umgebungsvariablen */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center space-x-2">
                        <Terminal className="h-5 w-5" />
                        <CardTitle>{t.images.detail.environmentVariables}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {data.Config.Env.map((env: string, i: number) => {
                                const [key, value] = env.split("=");
                                return (
                                    <div key={i} className="flex border-b pb-1 text-xs">
                                        <span className="font-bold w-1/3 truncate">{key}</span>
                                        <span className="text-zinc-500 w-2/3 break-all">{value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sektion: Layer-Struktur */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center space-x-2">
                        <Layers className="h-5 w-5" />
                        <CardTitle>{t.images.detail.rootFSLayers}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {data.RootFS.Layers.map((layer: string, i: number) => (
                                <div key={i} className="text-[10px] font-mono bg-muted p-1 rounded">
                                    Layer {i + 1}: {layer}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}