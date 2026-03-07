"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Network } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DockerNetwork {
    Id: string;
    Name: string;
    Driver: string;
    Scope: string;
    Created: string;
    ContainersCount: number;
}

export function NetworkList() {
    const [networks, setNetworks] = useState<DockerNetwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Create Network form state
    const [newNetworkName, setNewNetworkName] = useState("");
    const [newNetworkDriver, setNewNetworkDriver] = useState("bridge");
    const [newNetworkSubnet, setNewNetworkSubnet] = useState("");
    const [newNetworkGateway, setNewNetworkGateway] = useState("");
    const [newNetworkIPRange, setNewNetworkIPRange] = useState("");
    const [newNetworkEnableIPv6, setNewNetworkEnableIPv6] = useState(false);
    const [newNetworkIPv6Subnet, setNewNetworkIPv6Subnet] = useState("");
    const [newNetworkIPv6Gateway, setNewNetworkIPv6Gateway] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchNetworks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/networks");
            if (!res.ok) throw new Error("Fehler beim Laden der Netzwerke");
            const data = await res.json();
            setNetworks(data);
        } catch (error) {
            toast.error("Netzwerke konnten nicht geladen werden.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNetworks();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Möchtest du das Netzwerk ${name} wirklich löschen?`)) return;

        setActionLoading(id);
        try {
            const res = await fetch(`/api/networks/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Löschen fehlgeschlagen");
            }

            toast.success("Netzwerk gelöscht");
            await fetchNetworks();
        } catch (error: any) {
            toast.error(`Fehler: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateNetwork = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNetworkName.trim()) {
            toast.error("Der Netzwerkname darf nicht leer sein.");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/networks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Name: newNetworkName,
                    Driver: newNetworkDriver,
                    Subnet: newNetworkSubnet || undefined,
                    Gateway: newNetworkGateway || undefined,
                    IPRange: newNetworkIPRange || undefined,
                    EnableIPv6: newNetworkEnableIPv6,
                    IPv6Subnet: newNetworkIPv6Subnet || undefined,
                    IPv6Gateway: newNetworkIPv6Gateway || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Netzwerk konnte nicht erstellt werden");
            }

            toast.success(`Netzwerk "${newNetworkName}" erfolgreich erstellt.`);
            setIsCreateOpen(false);
            setNewNetworkName("");
            setNewNetworkDriver("bridge");
            setNewNetworkSubnet("");
            setNewNetworkGateway("");
            setNewNetworkIPRange("");
            setNewNetworkEnableIPv6(false);
            setNewNetworkIPv6Subnet("");
            setNewNetworkIPv6Gateway("");
            await fetchNetworks();
        } catch (error: any) {
            toast.error(`Fehler: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    // System networks that shouldn't typically be deleted
    const isSystemNetwork = (name: string) => {
        return ["bridge", "host", "none"].includes(name);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger render={<Button className="flex items-center gap-2" />}>
                        <Plus className="w-4 h-4" />
                        Netzwerk erstellen
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleCreateNetwork}>
                            <DialogHeader>
                                <DialogTitle>Neues Netzwerk erstellen</DialogTitle>
                                <DialogDescription>
                                    Legen Sie ein neues Docker-Netzwerk an. Optional können Sie detaillierte IPv4-Einstellungen vornehmen.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newNetworkName}
                                        onChange={(e) => setNewNetworkName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="z.B. my-app-network"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="driver" className="text-right">
                                        Treiber *
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={newNetworkDriver}
                                            onValueChange={(val) => setNewNetworkDriver(val || "bridge")}
                                        >
                                            <SelectTrigger id="driver">
                                                <SelectValue placeholder="Wähle einen Treiber" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bridge">bridge</SelectItem>
                                                <SelectItem value="overlay">overlay</SelectItem>
                                                <SelectItem value="macvlan">macvlan</SelectItem>
                                                <SelectItem value="ipvlan">ipvlan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative pt-4 w-full">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white dark:bg-zinc-950 px-2 text-xs text-zinc-500 uppercase tracking-wider">IPv4 Konfiguration (Optional)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                    <Label htmlFor="subnet" className="text-right text-zinc-500 dark:text-zinc-400">
                                        Subnet
                                    </Label>
                                    <Input
                                        id="subnet"
                                        value={newNetworkSubnet}
                                        onChange={(e) => setNewNetworkSubnet(e.target.value)}
                                        className="col-span-3"
                                        placeholder="z.B. 172.20.0.0/16"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="gateway" className="text-right text-zinc-500 dark:text-zinc-400">
                                        Gateway
                                    </Label>
                                    <Input
                                        id="gateway"
                                        value={newNetworkGateway}
                                        onChange={(e) => setNewNetworkGateway(e.target.value)}
                                        className="col-span-3"
                                        placeholder="z.B. 172.20.0.1"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="iprange" className="text-right text-zinc-500 dark:text-zinc-400">
                                        IP Range
                                    </Label>
                                    <Input
                                        id="iprange"
                                        value={newNetworkIPRange}
                                        onChange={(e) => setNewNetworkIPRange(e.target.value)}
                                        className="col-span-3"
                                        placeholder="z.B. 172.20.10.0/24"
                                    />
                                </div>

                                <div className="relative pt-4 w-full">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white dark:bg-zinc-950 px-2 text-xs text-zinc-500 uppercase tracking-wider">IPv6 Konfiguration (Optional)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                    <Label htmlFor="enable-ipv6" className="text-right text-zinc-500 dark:text-zinc-400">
                                        Enable IPv6
                                    </Label>
                                    <div className="col-span-3 flex items-center space-x-2">
                                        <Switch
                                            id="enable-ipv6"
                                            checked={newNetworkEnableIPv6}
                                            onCheckedChange={setNewNetworkEnableIPv6}
                                        />
                                        <Label htmlFor="enable-ipv6" className="font-normal text-sm text-zinc-500">IPv6 für dieses Netzwerk aktivieren</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="ipv6-subnet" className="text-right text-zinc-500 dark:text-zinc-400">
                                        IPv6 Subnet
                                    </Label>
                                    <Input
                                        id="ipv6-subnet"
                                        value={newNetworkIPv6Subnet}
                                        onChange={(e) => setNewNetworkIPv6Subnet(e.target.value)}
                                        className="col-span-3"
                                        placeholder="z.B. 2001:db8:1::/64"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="ipv6-gateway" className="text-right text-zinc-500 dark:text-zinc-400">
                                        IPv6 Gateway
                                    </Label>
                                    <Input
                                        id="ipv6-gateway"
                                        value={newNetworkIPv6Gateway}
                                        onChange={(e) => setNewNetworkIPv6Gateway(e.target.value)}
                                        className="col-span-3"
                                        placeholder="z.B. 2001:db8:1::1"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Wird erstellt..." : "Erstellen"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={fetchNetworks} disabled={loading}>
                    Aktualisieren
                </Button>
            </div>

            <div className="rounded-2xl border border-white/30 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl overflow-hidden shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-200 dark:border-zinc-800">
                            <TableHead>Name</TableHead>
                            <TableHead>Treiber</TableHead>
                            <TableHead>Scope</TableHead>
                            <TableHead>Erstellt am</TableHead>
                            <TableHead>Container</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    Lade Netzwerke...
                                </TableCell>
                            </TableRow>
                        ) : networks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    Keine Netzwerke gefunden.
                                </TableCell>
                            </TableRow>
                        ) : (
                            networks.map((net) => (
                                <TableRow key={net.Id} className="border-zinc-200 dark:border-zinc-800 group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Network className="w-4 h-4 text-zinc-400" />
                                            {net.Name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                                            {net.Driver}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {net.Scope}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {net.Created && net.Created !== "0001-01-01T00:00:00Z" ? formatDistanceToNow(new Date(net.Created), { addSuffix: true, locale: de }) : 'Unbekannt'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${net.ContainersCount > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                {net.ContainersCount}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className={`flex justify-end gap-2 transition-opacity ${isSystemNetwork(net.Name) ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                onClick={() => handleDelete(net.Id, net.Name)}
                                                disabled={actionLoading === net.Id || isSystemNetwork(net.Name)}
                                                title={isSystemNetwork(net.Name) ? "System-Netzwerk kann nicht gelöscht werden" : "Löschen"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
