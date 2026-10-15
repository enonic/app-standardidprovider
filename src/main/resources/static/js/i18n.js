'use strict' // eslint-disable-line

export function localise(key) {
    const messages = CONFIG.messages;
    const message = '#' + key + '#';

    if (messages !== null && messages[key] !== null) {
        return messages[key];
    }

    return message;
}
