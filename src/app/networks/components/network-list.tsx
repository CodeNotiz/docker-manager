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
import { de, enUS, es, fr } from "date-fns/locale";
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
  const { t, locale } = useLanguage();
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const dateLocales: Record<string, any> = { de, en: enUS, es, fr };
  const dateLocale = dateLocales[locale] || de;

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
    <div className="space-y-4 font-mono text-sm">
      <div className="flex items-center justify-between">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button className="flex items-center gap-2 rounded-none tracking-widest font-bold uppercase transition-none"><Plus className="w-4 h-4" />{t.networks.create}</Button>} />
          <DialogContent className="sm:max-w-[500px] bg-black border border-zinc-800 rounded-none font-mono">
            <form onSubmit={handleCreateNetwork}>
              <DialogHeader>
                <DialogTitle>{t.networks.createDialog.title}</DialogTitle>
                <DialogDescription>
                  {t.networks.createDialog.desc}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t.common.name} *
                  </Label>
                  <Input
                    id="name"
                    value={newNetworkName}
                    onChange={(e) => setNewNetworkName(e.target.value)}
                    className="col-span-3 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary focus-visible:border-primary"
                    placeholder="z.B. my-app-network"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="driver" className="text-right">
                    {t.networks.driver} *
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newNetworkDriver}
                      onValueChange={(val) =>
                        setNewNetworkDriver(val || "bridge")
                      }
                    >
                      <SelectTrigger
                        id="driver"
                        className="rounded-none border-zinc-800 bg-zinc-950 focus:ring-primary"
                      >
                        <SelectValue placeholder="Wähle einen Treiber" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-zinc-800 bg-black font-mono">
                        <SelectItem
                          value="bridge"
                          className="rounded-none focus:bg-primary focus:text-black"
                        >
                          bridge
                        </SelectItem>
                        <SelectItem
                          value="overlay"
                          className="rounded-none focus:bg-primary focus:text-black"
                        >
                          overlay
                        </SelectItem>
                        <SelectItem
                          value="macvlan"
                          className="rounded-none focus:bg-primary focus:text-black"
                        >
                          macvlan
                        </SelectItem>
                        <SelectItem
                          value="ipvlan"
                          className="rounded-none focus:bg-primary focus:text-black"
                        >
                          ipvlan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="relative pt-4 w-full">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-zinc-950 px-2 text-xs text-zinc-500 uppercase tracking-wider">
                      IPv4 Konfiguration (Optional)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                  <Label
                    htmlFor="subnet"
                    className="text-right text-zinc-500 dark:text-zinc-400"
                  >
                    Subnet
                  </Label>
                  <Input
                    id="subnet"
                    value={newNetworkSubnet}
                    onChange={(e) => setNewNetworkSubnet(e.target.value)}
                    className="col-span-3 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary"
                    placeholder="z.B. 172.20.0.0/16"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="gateway"
                    className="text-right text-zinc-500 dark:text-zinc-400"
                  >
                    Gateway
                  </Label>
                  <Input
                    id="gateway"
                    value={newNetworkGateway}
                    onChange={(e) => setNewNetworkGateway(e.target.value)}
                    className="col-span-3 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary"
                    placeholder="z.B. 172.20.0.1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="iprange"
                    className="text-right text-zinc-500 dark:text-zinc-400"
                  >
                    IP Range
                  </Label>
                  <Input
                    id="iprange"
                    value={newNetworkIPRange}
                    onChange={(e) => setNewNetworkIPRange(e.target.value)}
                    className="col-span-3 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary"
                    placeholder="z.B. 172.20.10.0/24"
                  />
                </div>

                <div className="relative pt-4 w-full">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-zinc-950 px-2 text-xs text-zinc-500 uppercase tracking-wider">
                      IPv6 Konfiguration (Optional)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4 mt-2">
                  <Label
                    htmlFor="enable-ipv6"
                    className="text-right text-zinc-500 dark:text-zinc-400"
                  >
                    Enable IPv6
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="enable-ipv6"
                      checked={newNetworkEnableIPv6}
                      onCheckedChange={setNewNetworkEnableIPv6}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label
                      htmlFor="enable-ipv6"
                      className="font-normal text-sm text-zinc-500"
                    >
                      IPv6 für dieses Netzwerk aktivieren
                    </Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="ipv6-subnet"
                    className="text-right text-zinc-500 dark:text-zinc-400"
                  >
                    IPv6 Subnet
                  </Label>
                  <Input
                    id="ipv6-subnet"
                    value={newNetworkIPv6Subnet}
                    onChange={(e) => setNewNetworkIPv6Subnet(e.target.value)}
                    className="col-span-3 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary"
                    placeholder="z.B. 2001:db8:1::/64"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="ipv6-gateway"
                    className="text-right text-zinc-500 dark:text-zinc-400"
                  >
                    IPv6 Gateway
                  </Label>
                  <Input
                    id="ipv6-gateway"
                    value={newNetworkIPv6Gateway}
                    onChange={(e) => setNewNetworkIPv6Gateway(e.target.value)}
                    className="col-span-3 rounded-none border-zinc-800 bg-zinc-950 focus-visible:ring-primary"
                    placeholder="z.B. 2001:db8:1::1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-none tracking-widest font-bold uppercase transition-none border-zinc-800 hover:bg-primary hover:text-black"
                >
                  {isCreating ? t.common.loading : t.common.create}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={fetchNetworks}
          disabled={loading}
          className="rounded-none tracking-widest font-bold uppercase transition-none border-zinc-800 hover:bg-zinc-800 hover:text-white"
        >
          {t.common.refresh}
        </Button>
      </div>

      <div className="border border-zinc-800 bg-black overflow-hidden font-mono text-sm">
        <Table>
          <TableHeader className="bg-zinc-950 border-b border-zinc-800">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.common.name}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.networks.driver}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                Scope
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.images.created}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase">
                {t.networks.containers}
              </TableHead>
              <TableHead className="text-zinc-300 font-bold tracking-widest uppercase text-right">
                {t.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-zinc-500 tracking-widest uppercase"
                >
                  {t.common.loading}
                </TableCell>
              </TableRow>
            ) : networks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-zinc-500 tracking-widest uppercase"
                >
                  {t.networks.noNetworks}
                </TableCell>
              </TableRow>
            ) : (
              networks.map((net) => (
                <TableRow
                  key={net.Id}
                  className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-none group text-zinc-300"
                >
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-zinc-500" />
                      {net.Name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-1 py-0 text-[10px] font-bold tracking-widest uppercase bg-zinc-800 text-zinc-400">
                      {net.Driver}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {net.Scope}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {net.Created && net.Created !== "0001-01-01T00:00:00Z"
                      ? formatDistanceToNow(new Date(net.Created), {
                          addSuffix: true,
                          locale: dateLocale,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-none text-xs font-bold ${net.ContainersCount > 0 ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500"}`}
                      >
                        {net.ContainersCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex justify-end gap-2 transition-none ${isSystemNetwork(net.Name) ? "opacity-30" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-none border-zinc-800 text-zinc-500 hover:text-black hover:bg-red-500 hover:border-red-500 transition-none"
                        onClick={() => handleDelete(net.Id, net.Name)}
                        disabled={
                          actionLoading === net.Id || isSystemNetwork(net.Name)
                        }
                        title={
                          isSystemNetwork(net.Name)
                            ? t.networks.systemNetworkDesc
                            : t.networks.remove
                        }
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
