'use strict' // eslint-disable-line

async function loadConfig() {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const backImage = document.getElementById('background-image');

            if (backImage) {
                backImage.classList.remove('empty');
            }
        }, 100);
    });

    const attr = 'data-config-service-url';
    const configServiceUrl = document.currentScript.getAttribute(attr);
    const response = await fetch(configServiceUrl);

    if (!response.ok) {
        const msg = 'Could not fetch required app config:';
        throw new Error(`${msg} ${response.status}`);
    }

    const data = await response.json();
    data.messages = JSON.parse(data.messages);
    window.CONFIG = data;
}

loadConfig().finally(() => {
    require('../styles/main.less');
    require('./welcome');
    require('./login');
    require('./creation');
});
