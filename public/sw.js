import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (url.pathname.endsWith('/upload') && event.request.method === 'POST') {
        event.respondWith(
            (async () => {
                const formData = await event.request.formData();
                const files = formData.getAll("files");
                if (!files.length) {
                    return Response.redirect("failed", 303);
                }
                const cache = await caches.open('upload-files');
                files.forEach(async (file, index) => {
                    const response = new Response(file, {
                        headers: {
                            'Content-Type': file.type,
                            'Content-Disposition': `inline; filename="${file.name}"`
                        }
                    });
                    await cache.put(`upload/${index}`, response);
                });
                return Response.redirect("upload", 303);
            })(),
        );
    } else if (url.pathname.endsWith("/callback")) {
        event.respondWith(fetch("index.html"));
    }
});
