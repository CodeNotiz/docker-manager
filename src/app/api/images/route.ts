import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const images = await docker.listImages({ all: true });

        const formattedImages = images.map((image) => {
            // Find if this image is used by any container
            // This requires listing containers, but for speed, we'll mark dangling images first
            // A more thorough "unused" check would require checking cross-referencing containers.
            // We'll return just the images here, and handle the "unused" logic partially here.

            const repoTags = image.RepoTags || [];
            const isDangling = repoTags.includes('<none>:<none>');
            const name = isDangling ? '<none>' : repoTags[0]?.split(':')[0] || '<none>';
            const tag = isDangling ? '<none>' : repoTags[0]?.split(':')[1] || 'latest';

            return {
                Id: image.Id,
                ParentId: image.ParentId,
                RepoTags: repoTags,
                Name: name,
                Tag: tag,
                Size: image.Size,
                Created: image.Created,
                // In docker terminology, an image without tags is dangling.
                IsDangling: isDangling,
                Containers: image.Containers // number of running containers using this image
            };
        });

        // To accurately know if an image is "unused" (not dangling, but not used by any container),
        // we need all containers.
        const containers = await docker.listContainers({ all: true });
        const usedImageIds = new Set(containers.map(c => c.ImageID));

        const finalImages = formattedImages.map(img => ({
            ...img,
            IsUnused: !usedImageIds.has(img.Id),
        }));

        return NextResponse.json(finalImages);
    } catch (error: any) {
        console.error('Failed to fetch images:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
