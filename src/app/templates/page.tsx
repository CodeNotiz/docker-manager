import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/config";
import { TemplateList } from "./components/template-list";

export default async function TemplatesPage() {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "de";
    const t = getDictionary(locale);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.templates?.title || "App Templates"}</h1>
                <p className="text-zinc-500">
                    {t.templates?.subtitle || "Schnelle Bereitstellung von vorgefertigten Docker-Anwendungen."}
                </p>
            </div>

            <TemplateList />
        </div>
    );
}