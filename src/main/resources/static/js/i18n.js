'use strict' // eslint-disable-line

exports.localise = (function (bundle) {
    const messages = bundle;

    return function (key) {
        const message = '#' + key + '#';

        if (messages !== null && messages[key] !== null) {
            return messages[key];
        }

        return message;
    };
})(CONFIG.messages);
