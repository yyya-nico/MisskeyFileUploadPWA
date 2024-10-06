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
    window.addEventListener('message', async e => {
        if (e.origin === location.origin) {
            const fileInfo = getCachedFile(e.data.fileName);
            files.push(fileInfo);
            attachFileItem(fileInfo);
            URL.revokeObjectURL(fileInfo.url);
        }
    });
    uploadBtn.addEventListener('click', () => {
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
                    }
                })
                .catch(e => {
                    console.error('Failed to load', e);
                });
        });
        files.length = 0;
        caches.delete('upload-files');
    });
});