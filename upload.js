document.addEventListener('DOMContentLoaded', async () => {
    const baseUrl = import.meta.env.BASE_URL;
    const filesList = document.getElementById('files');
    const uploadBtn = document.getElementById('upload');
    const sendTo = localStorage.getItem('MFUP:sendTo');
    const token = localStorage.getItem('MFUP:auth');
    if (!sendTo || !token) {
        location.href = baseUrl;
    }
    const getCachedFiles = async () => {
        const cache = await caches.open('upload-files');
        const files = [];
        let index = 0;
        while (true) {
            const cachedResponse = await cache.match(`upload/${index}`);
            if (!cachedResponse) break;

            const blob = await cachedResponse.blob();
            files.push({
                blob,
                url: URL.createObjectURL(blob),
                type: blob.type,
                index
            });

            index++;
        }

        return files;
    }
    const attachFileItem = obj => {
        const li = document.createElement('li');
        li.innerHTML = 
        obj.type.startsWith('image/') ? [
        `<figure>`,
        `<img src="${obj.url}" alt="${obj.index}" />`,
        `<figcaption>${obj.index}, ${obj.type}</figcaption>`,
        `</figure>`].join('')
        :
        `${obj.index}, ${obj.type}`;
        filesList.appendChild(li);
    };

    const files = await getCachedFiles();
    files.forEach(file => {
        attachFileItem(file);
        URL.revokeObjectURL(file);
    });

    uploadBtn.addEventListener('click', async () => {
        uploadBtn.disabled = true;
        if (files.length === 0) {
            alert('ファイルがありません。');
            await caches.delete('upload-files');
            return;
        }
        let hasError = false;
        const url = `${sendTo}/api/drive/files/create`;
        files.forEach(file => {
            const form = new FormData();
            form.append('force', 'true');
            form.append('file', file.blob);
    
            const options = {method: 'POST', headers: {Authorization: token}};
    
            options.body = form;
    
            fetch(url, options)
                .then(response => {
                    if (response.status !== 200) {
                      console.log('error or no content', response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        alert(error.message + '\n\nエラーコード: ' + error.code);
                        hasError = true;
                    }
                })
                .catch(e => {
                    console.error('Failed to load', e);
                });
        });
        files.length = 0;
        await caches.delete('upload-files');
        if (hasError) {
            alert('アップロードに失敗しました。');
        } else {
            alert('アップロードが完了しました。');
        }
    });
});