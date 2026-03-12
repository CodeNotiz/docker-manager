import { formatDistanceToNow } from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import { getDictionary } from "@/i18n/config";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Terminal,
  Pause,
} from "lucide-react";
import docker from "@/lib/docker";
import { notFound } from "next/navigation";
import { ContainerActions } from "./container-actions";

export default async function ContainerDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "de";
  const t = getDictionary(locale);

  const dateLocales: Record<string, any> = { de, en: enUS, es, fr };
  const dateLocale = dateLocales[locale] || de;

  let details;
  try {
    const container = docker.getContainer(id);
    details = await container.inspect();
  } catch (e) {
    return notFound();
  }

  const containerName = details.Name.replace(/^\//, "");
  const isRunning = details.State.Running && !details.State.Paused;
  const isPaused = details.State.Paused;

  return (
    <div className="space-y-6 font-mono text-sm text-zinc-300">
      <div className="flex items-center gap-4">
        <Link href="/containers" passHref>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-none hover:bg-zinc-800 transition-none text-zinc-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold flex items-center gap-3 uppercase tracking-widest text-white">
            {containerName}
            <Badge
              variant={isRunning ? "default" : "secondary"}
              className={`rounded-none uppercase tracking-widest text-[10px] px-2 py-0 border-none ${isRunning ? "bg-primary text-black font-bold" : "bg-zinc-800 text-zinc-400"}`}
            >
              {details.State.Status}
            </Badge>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-black p-5 rounded-none border border-zinc-800 shadow-none">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white">Allgemein</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">ID</span>
                <span
                  className="font-mono truncate block text-zinc-300"
                  title={details.Id}
                >
                  {details.Id.substring(0, 12)}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Image</span>
                <span
                  className="font-mono truncate block text-zinc-300"
                  title={details.Config.Image}
                >
                  {details.Config.Image}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Erstellt am</span>
                <span className="text-zinc-300">
                  {formatDistanceToNow(new Date(details.Created), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Entrypoint</span>
                <span className="font-mono truncate block text-zinc-300">
                  {Array.isArray(details.Config.Entrypoint)
                    ? details.Config.Entrypoint.join(" ")
                    : details.Config.Entrypoint || "-"}
                </span>
              </div>
            </div>
          </div>

          {Object.keys(details.NetworkSettings.Networks).length > 0 && (
            <div className="bg-black p-5 rounded-none border border-zinc-800 shadow-none">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white">Netzwerke</h3>
              <div className="space-y-3">
                {Object.entries(details.NetworkSettings.Networks).map(
                  ([netName, netData]: [string, any]) => (
                    <div
                      key={netName}
                      className="bg-zinc-950 border border-zinc-800 rounded-none p-3 text-sm"
                    >
                      <div className="font-bold text-white mb-2 uppercase tracking-widest">
                        {netName}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">
                            IP-Adresse
                          </span>
                          <span className="font-mono text-zinc-300">
                            {netData.IPAddress || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">
                            Gateway
                          </span>
                          <span className="font-mono text-zinc-300">
                            {netData.Gateway || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">
                            Mac Address
                          </span>
                          <span className="font-mono text-zinc-300">
                            {netData.MacAddress || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-black p-5 rounded-none border border-zinc-800 shadow-none flex flex-col gap-2">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white">Ansichten</h3>
            <Link href={`/containers/${id}/logs`} passHref>
              <Button variant="outline" className="w-full justify-start rounded-none border-zinc-800 text-zinc-400 hover:bg-white hover:text-black hover:border-white transition-none uppercase font-bold tracking-widest">
                <Terminal className="w-4 h-4 mr-2" />
                {t.containers.logs}
              </Button>
            </Link>
            <Link
              href={`/containers/${id}/terminal`}
              className={!isRunning ? "pointer-events-none opacity-50" : ""}
              passHref
            >
              <Button
                variant="outline"
                className="w-full justify-start rounded-none border-zinc-800 text-zinc-400 hover:bg-white hover:text-black hover:border-white transition-none uppercase font-bold tracking-widest"
                disabled={!isRunning}
              >
                <Terminal className="w-4 h-4 mr-2" />
                Terminal
              </Button>
            </Link>
          </div>

          <div className="bg-black p-5 rounded-none border border-zinc-800 shadow-none flex flex-col gap-2">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white">Steuerung</h3>
            <ContainerActions
              id={id}
              isRunning={isRunning}
              isPaused={isPaused}
            />
          </div>

          {details.Mounts && details.Mounts.length > 0 && (
            <div className="bg-black p-5 rounded-none border border-zinc-800 shadow-none">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white">
                Mounts ({details.Mounts.length})
              </h3>
              <ul className="space-y-3">
                {details.Mounts.map((mount: any, idx: number) => (
                  <li
                    key={idx}
                    className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-none text-xs break-all"
                  >
                    <div className="flex gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 rounded-none uppercase font-bold tracking-widest bg-zinc-800 text-zinc-400"
                      >
                        {mount.Type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 rounded-none uppercase font-bold tracking-widest border-zinc-700 text-zinc-400"
                      >
                        {mount.RW ? "RW" : "RO"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-[10px] text-zinc-500 bg-black p-2 rounded-none border border-zinc-800">
                      <span>{mount.Source}</span>
                      <span className="text-center text-zinc-700">
                        ↓
                      </span>
                      <span className="text-zinc-300">
                        {mount.Destination}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {details.Config.Env && details.Config.Env.length > 0 && (
        <div className="bg-black p-5 rounded-none border border-zinc-800 shadow-none">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-white">Environment Filter (ENV)</h3>
          <div className="bg-zinc-950 border border-zinc-800 rounded-none p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-1.5 break-all">
              {details.Config.Env.map((env: string, idx: number) => {
                const [key, ...valParts] = env.split("=");
                const val = valParts.join("=");
                return (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row gap-1 sm:gap-6 border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0"
                  >
                    <span className="text-primary font-bold uppercase tracking-widest min-w-[200px] shrink-0">
                      {key}
                    </span>
                    <span className="text-zinc-400 mt-0.5 sm:mt-0">
                      {val || '""'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
