import { ContainerList } from "./components/container-list";

export default function ContainersPage() {
  return (
    <div className="flex flex-col gap-6 font-mono mt-4">
      <div className="border-l-[3px] border-primary pl-4 py-1">
        <h1 className="text-3xl font-bold tracking-widest text-white uppercase">
          Container
        </h1>
        <p className="text-zinc-400 mt-1 text-xs uppercase tracking-widest">
          VERWALTE DEINE LOKALEN DOCKER-CONTAINER.
        </p>
      </div>

      <ContainerList />
    </div>
  );
}
