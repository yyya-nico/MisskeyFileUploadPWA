import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("fetch", async (event) => {
    if (event.request.url.endsWith('upload') && event.request.method === 'POST') {
        const formData = await event.request.formData();
        const files = formData.getAll("files");
        event.respondWith(
            (() => {
                if (!files.length) {
                    return Response.redirect("failed", 303);
                }
                return Response.redirect("upload", 303);
            })(),
        );
        files.forEach(async file => {
            const cache = await caches.open('upload-files');
            const response = new Response(file, {
                headers: { 'Content-Type': file.type }
            });
            await cache.put(`upload/${file.name}`, response);

            // 必要に応じてクライアントにメッセージを送る
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({
                    fileName: file.name,
                    fileUrl: `upload/${file.name}`
                }));
            });

        });
    } else if (event.request.url.includes("/callback")) {
        event.respondWith(fetch("index.html"));
    }
});
