import { NetworkList } from "./components/network-list";

export default function NetworksPage() {
  return (
    <div className="flex flex-col gap-6 font-mono mt-4">
      <div className="border-l-[3px] border-primary pl-4 py-1">
        <h1 className="text-3xl font-bold tracking-widest text-white uppercase">
          Netzwerke
        </h1>
        <p className="text-zinc-400 mt-1 text-xs uppercase tracking-widest">
          VERWALTEN SIE IHRE DOCKER-NETZWERKE, LEGEN SIE NEUE AN ODER LÖSCHEN
          SIE UNGENUTZTE NETZWERKE.
        </p>
      </div>

      <NetworkList />
    </div>
  );
}
