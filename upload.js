document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = import.meta.env.BASE_URL;
    const filesList = document.getElementById('files');
    const uploadBtn = document.getElementById('upload');
    const sendTo = localStorage.getItem('MFUP:sendTo');
    const token = localStorage.getItem('MFUP:auth');
    const files = [];
    if (!sendTo || !token) {
        location.href = baseUrl;
    }
    const getCachedFile = async fileName => {
        const cache = await caches.open('upload-files');
        const cachedResponse = await cache.match(`upload/${fileName}`);
        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            return {
                fileName,
                blob,
                url: URL.createObjectURL(blob),
                type: blob.type
            };
        }
    }
    const attachFileItem = obj => {
        const li = document.createElement('li');
        li.innerHTML = 
        obj.type.startsWith('image/') ? [
        `<figure>`,
        `<img src="${obj.url}" alt="${obj.fileName}" />`,
        `<figcaption>${obj.fileName}</figcaption>`,
        `</figure>`].join('')
        :
        obj.fileName;
        filesList.appendChild(li);
    };
    navigator.serviceWorker.addEventListener('message', async e => {
        if (e.origin === location.origin) {
            const fileInfo = await getCachedFile(e.data.fileName);
            files.push(fileInfo);
            attachFileItem(fileInfo);
            URL.revokeObjectURL(fileInfo.url);
        }
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