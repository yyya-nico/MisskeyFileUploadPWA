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
                files.forEach(async file => {
                    const cache = await caches.open('upload-files');
                    const response = new Response(file, {
                        headers: { 'Content-Type': file.type }
                    });
                    await cache.put(`upload/${file.name}`, response);

                    // 必要に応じてクライアントにメッセージを送る
                    self.clients.matchAll().then(clients => {
                        console.log(clients);
                        clients.forEach(client => client.postMessage({
                            fileName: file.name,
                            fileUrl: `upload/${file.name}`
                        }));
                    });

                });
                return Response.redirect("upload", 303);
            })(),
        );
    } else if (url.pathname.endsWith("/callback")) {
        event.respondWith(fetch("index.html"));
    }
});
