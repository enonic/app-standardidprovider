exports.localise = (function(bundle) {
    var messages = bundle;

    return function(key) {
        var message = '#' + key + '#';

        if (messages != null && messages[key] != null) {
            return messages[key];
        }

        return message;
    };
})(CONFIG.messages);
