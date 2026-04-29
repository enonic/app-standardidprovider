'use strict' // eslint-disable-line

function loadConfig() {
    const attr = 'data-config-script-id';
    const configScriptId = document.currentScript.getAttribute(attr);

    const config = document.getElementById(`config-json-${configScriptId}`);
    if (!config) {
        throw Error('Could not find app config');
    }

    try {
        window.CONFIG = JSON.parse(config.innerText);
    } catch {
        throw Error('Could not parse app config');
    }
}

function initBackground() {
    const bg = document.getElementById('login-background');
    if (!bg) {
        return;
    }
    const url = bg.getAttribute('data-background-url');
    if (!url) {
        return;
    }
    bg.style.backgroundImage = `url("${url}")`;
    const img = new Image();
    img.onload = () => {
        bg.classList.add('loaded');
    };
    img.src = url;
}

(() => {
    loadConfig();
    require('../styles/main.less');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackground, {once: true});
    } else {
        initBackground();
    }
    require('./welcome');
    require('./login');
    require('./creation');
})();
