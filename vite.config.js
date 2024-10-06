import { VitePWA } from 'vite-plugin-pwa'

export default {
    base: '/MisskeyFileUploadPWA/',
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        injectRegister: 'auto',
        manifest: {
            "name": "Misskey ファイルアップロードPWA",
            "short_name": "アップロード",
            "description": "Misskeyのドライブへファイルを簡単に共有します。",
            "start_url": "/MisskeyFileUploadPWA/",
            "display": "standalone",
            "theme_color": "#101010",
            "background_color": "#1f1f1f",
            "lang": "ja-JP",
            "dir": "ltr",
            "icons": [
                {
                    "src": "icon/icon-512x512.png",
                    "sizes": "512x512",
                    "purpose": "maskable"
                },
                {
                    "src": "icon/icon-192x192.png",
                    "sizes": "192x192",
                    "purpose": "maskable"
                },
                {
                    "src": "icon/icon-144x144.png",
                    "sizes": "144x144",
                    "purpose": "maskable"
                },
                {
                    "src": "icon/icon-96x96.png",
                    "sizes": "96x96",
                    "purpose": "maskable"
                },
                {
                    "src": "icon/icon-72x72.png",
                    "sizes": "72x72",
                    "purpose": "maskable"
                },
                {
                    "src": "icon/icon-48x48.png",
                    "sizes": "48x48",
                    "purpose": "maskable"
                }
            ],
            "share_target": {
                "action": "/MisskeyFileUploadPWA/upload",
                "method": "POST",
                "enctype": "multipart/form-data",
                "params": {
                    "files": [
                        {
                        "name": "files",
                        "accept": ["*/*",".*"]
                        }
                    ]
                }
            }
        }
      })
    ]
}