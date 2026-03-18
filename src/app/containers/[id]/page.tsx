import { formatDistanceToNow } from "date-fns";
import { de, enUS, es, fr, ja, ru, uk, zhCN } from "date-fns/locale";
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
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en: enUS";
  const t = getDictionary(locale);

  const dateLocales: Record<string, any> = { de, en: enUS, es, fr, ja, ru, uk, zh: zhCN };
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/containers" passHref>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {containerName}
            <Badge
              variant={isRunning ? "default" : "secondary"}
              className={isRunning ? "bg-green-500" : ""}
            >
              {details.State.Status}
            </Badge>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg">
            <h3 className="text-lg font-medium mb-4">{t.containers.detailsGeneral}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-zinc-500 block">{t.containers.detailsId}</span>
                <span
                  className="font-mono text-sm truncate block"
                  title={details.Id}
                >
                  {details.Id.substring(0, 12)}
                </span>
              </div>
              <div>
                <span className="text-sm text-zinc-500 block">{t.containers.detailsImage}</span>
                <span
                  className="font-mono text-sm truncate block"
                  title={details.Config.Image}
                >
                  {details.Config.Image}
                </span>
              </div>
              <div>
                <span className="text-sm text-zinc-500 block">{t.containers.detailsCreated}</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(details.Created), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
              <div>
                <span className="text-sm text-zinc-500 block">{t.containers.detailsEntrypoint}</span>
                <span className="font-mono text-sm truncate block">
                  {Array.isArray(details.Config.Entrypoint)
                    ? details.Config.Entrypoint.join(" ")
                    : details.Config.Entrypoint || "-"}
                </span>
              </div>
            </div>
          </div>

          {Object.keys(details.NetworkSettings.Networks).length > 0 && (
            <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg">
              <h3 className="text-lg font-medium mb-4">{t.containers.detailsNetworks}</h3>
              <div className="space-y-3">
                {Object.entries(details.NetworkSettings.Networks).map(
                  ([netName, netData]: [string, any]) => (
                    <div
                      key={netName}
                      className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg p-3 text-sm"
                    >
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        {netName}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500 block mb-0.5">
                            {t.containers.detailsIpAddress}
                          </span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {netData.IPAddress || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block mb-0.5">
                            {t.containers.detailsGateway}
                          </span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {netData.Gateway || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block mb-0.5">
                            {t.containers.detailsMacAddress}
                          </span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
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
          <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg flex flex-col gap-2">
            <h3 className="text-lg font-medium mb-2">{t.containers.detailsViews}</h3>
            <Link href={`/containers/${id}/logs`} passHref>
              <Button variant="outline" className="w-full justify-start">
                <Terminal className="w-4 h-4 mr-2" />
                {t.containers.logs} {t.containers.detailsViewLogs}
              </Button>
            </Link>
            <Link
              href={`/containers/${id}/terminal`}
              className={!isRunning ? "pointer-events-none opacity-50" : ""}
              passHref
            >
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!isRunning}
              >
                <Terminal className="w-4 h-4 mr-2" />
                {t.containers.detailsInteractiveTerminal}
              </Button>
            </Link>
          </div>

          <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg flex flex-col gap-2">
            <h3 className="text-lg font-medium mb-2">{t.containers.detailsControl}</h3>
            <ContainerActions
              id={id}
              isRunning={isRunning}
              isPaused={isPaused}
            />
          </div>

          {details.Mounts && details.Mounts.length > 0 && (
            <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg">
              <h3 className="text-lg font-medium mb-4">
                {t.containers.detailsMounts} ({details.Mounts.length})
              </h3>
              <ul className="space-y-3">
                {details.Mounts.map((mount: any, idx: number) => (
                  <li
                    key={idx}
                    className="bg-zinc-100/50 dark:bg-zinc-900/50 p-2.5 rounded-lg text-xs break-all"
                  >
                    <div className="flex gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {mount.Type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {mount.RW ? "RW" : "RO"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-black/20 p-2 rounded border border-zinc-200/50 dark:border-zinc-800/50">
                      <span>{mount.Source}</span>
                      <span className="text-center text-zinc-400 opacity-50">
                        ↓
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-200">
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
        <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-5 rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-lg">
          <h3 className="text-lg font-medium mb-4">{t.containers.detailsEnvFilter}</h3>
          <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            <ul className="space-y-1.5 break-all">
              {details.Config.Env.map((env: string, idx: number) => {
                const [key, ...valParts] = env.split("=");
                const val = valParts.join("=");
                return (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row gap-1 sm:gap-6"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-semibold min-w-[200px] shrink-0">
                      {key}
                    </span>
                    <span className="text-zinc-600 mt-0.5 sm:mt-0 dark:text-zinc-400">
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
