document.addEventListener('DOMContentLoaded', () => {
    const pleaseClose = document.querySelector('.please-close');
    const closeBtn = document.querySelector('button');
    if (window === window.top && window.history.length <= 1) {
        pleaseClose.remove();
        closeBtn.addEventListener('click', () => {
            window.close();
        });
    } else {
        closeBtn.remove();
    }
});