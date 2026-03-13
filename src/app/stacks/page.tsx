import { StackList } from "./components/stack-list";

export default function StacksPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Stacks (Docker Compose)</h1>
                <p className="text-zinc-500">
                    Erstellen und verwalten Sie komplexe Anwendungen mit Docker Compose Stacks.
                </p>
            </div>

            <StackList />
        </div>
    );
}
