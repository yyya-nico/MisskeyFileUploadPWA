import { goMiAuth, saveToken } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
    if (location.pathname.endsWith('callback')) {
        await saveToken();    
    }

    const sendTo = localStorage.getItem('MFUP:sendTo');
    const token = localStorage.getItem('MFUP:auth');
    const serverForm = document.forms['server'];
    const hostInput = serverForm.elements['host'];
    const verification = document.getElementById('verification');
    const installBtn = document.getElementById('install');
    let installPromptEvent = null;

    if (sendTo && token) {
        hostInput.value = sendTo.replace(/https?:\/\/|\//g, '');
        verification.classList.add('verified');
        verification.textContent = '✓認証済み';
    } else {
        verification.classList.add('unverified');
        verification.textContent = '✗未認証';
    }

    serverForm.addEventListener('submit', async e => {
        e.preventDefault();
        const host = hostInput.value.replace(/https?:\/\/|\//g, '');
        hostInput.value = host;
        goMiAuth(host);
    });

    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        installPromptEvent = e;
        installBtn.disabled = false;
    });

    installBtn.addEventListener('click', () => {
        installPromptEvent.prompt();
        installPromptEvent.userChoice.then(choice => {
            console.log(choice);
            if (choice.outcome === 'accepted') {
                installBtn.textContent = 'インストール済み';
                installBtn.disabled = true;
            }
        });
    });
});