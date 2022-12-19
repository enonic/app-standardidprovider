'use strict' // eslint-disable-line

function getConfigServiceUrl() {
    const fullConfigServiceUrl = document.currentScript.getAttribute(
        'data-config-service-url'
    );
    const relativeServiceUrl = fullConfigServiceUrl.replace(
        document.location.pathname,
        ''
    );
    const baseAdminUri = document.currentScript.getAttribute(
        'data-base-admin-uri'
    );

    return document.location.origin + baseAdminUri + relativeServiceUrl;
}

async function loadConfig() {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const backImage = document.getElementById('background-image');

            if (backImage) {
                backImage.classList.remove('empty');
            }
        }, 100);
    });

    const response = await fetch(getConfigServiceUrl());

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
