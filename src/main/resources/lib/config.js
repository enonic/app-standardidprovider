const portalLib = require('/lib/xp/portal');
const adminLib = require('/lib/xp/admin');

exports.isLoginWithoutUserEnabled = function() {
    return app.config.loginWithoutUser == null
        ? true
        : app.config.loginWithoutUser;
};

exports.isServiceAccountsEnabled = function () {
    return app.config.serviceAccountsEnabled == null ? true : app.config.serviceAccountsEnabled === 'true';
};

exports.getConfig = () => {
    return {
        idProviderKey: portalLib.getIdProviderKey(),
        idProviderUrl: portalLib.idProviderUrl(),
        messages: JSON.parse(adminLib.getPhrases())
    }
}
