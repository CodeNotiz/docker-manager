import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/config";
import { ContainerList } from "./components/container-list";

export default async function ContainersPage() {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "de";
    const t = getDictionary(locale);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.containers.title}</h1>
                <p className="text-muted-foreground">{t.containers.pageSubtitle}</p>
            </div>

            <ContainerList />
        </div>
    );
}
