import { ImageList } from "./components/image-list";

export default function ImagesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Images</h1>
                <p className="text-zinc-500">
                    Verwalten Sie Ihre lokalen Docker-Images, löschen Sie ungenutzte Images oder führen Sie ein Prune durch.
                </p>
            </div>

            <ImageList />
        </div>
    );
}
