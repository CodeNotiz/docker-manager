import { ImageList } from "./components/image-list";

export default function ImagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-l-[3px] border-primary pl-4 py-1">
        <h1 className="text-3xl font-bold tracking-widest text-white uppercase">
          Images
        </h1>
        <p className="text-zinc-400 mt-1 text-xs uppercase tracking-widest">
          VERWALTE DEINE LOKALEN DOCKER-IMAGES, LÖSCHE UNGENUTZTE IMAGES ODER FÜHRE EIN PRUNE DURCH.
        </p>
      </div>

      <ImageList />
    </div>
  );
}
