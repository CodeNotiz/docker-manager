import { NetworkList } from "./components/network-list";

export default function NetworksPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Netzwerke</h1>
                <p className="text-zinc-500">
                    Verwalten Sie Ihre Docker-Netzwerke, legen Sie neue an oder löschen Sie ungenutzte Netzwerke.
                </p>
            </div>

            <NetworkList />
        </div>
    );
}
