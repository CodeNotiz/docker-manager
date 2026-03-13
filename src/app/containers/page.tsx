import { ContainerList } from "./components/container-list";

export default function ContainersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Container</h1>
                <p className="text-muted-foreground">Verwalte deine lokalen Docker-Container.</p>
            </div>

            <ContainerList />
        </div>
    );
}
