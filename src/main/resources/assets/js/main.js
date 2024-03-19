'use strict' // eslint-disable-line

async function loadConfig() {
    setTimeout(() => {
        const backImage = document.getElementById('background-image');

        if (backImage) {
            backImage.classList.remove('empty');
        }
    }, 100);

    const attr = 'data-config-script-id';
    const configScriptId = document.currentScript.getAttribute(attr);

    const config = document.getElementById(`config-json-${configScriptId}`);
    if (!config) {
        throw Error('Could not find app config');
    }

    try {
        window.CONFIG = JSON.parse(config.innerText);
    } catch (e) {
        throw Error('Could not parse app config');
    }
}

(() => {
    loadConfig().finally(() => {
        require('../styles/main.less');
        require('./welcome');
        require('./login');
        require('./creation');
    });
})();
