import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/config";
import { NetworkList } from "./components/network-list";

export default async function NetworksPage() {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "de";
    const t = getDictionary(locale);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.networks.title}</h1>
                <p className="text-zinc-500">
                    {t.networks.pageSubtitle}
                </p>
            </div>

            <NetworkList />
        </div>
    );
}
