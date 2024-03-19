const portalLib = require('/lib/xp/portal');
const adminLib = require('/lib/xp/admin');

exports.isLoginWithoutUserEnabled = function() {
    return app.config.loginWithoutUser == null
        ? true
        : app.config.loginWithoutUser;
};

exports.getConfig = () => {
    return {
        idProviderKey: portalLib.getIdProviderKey(),
        idProviderUrl: portalLib.idProviderUrl({
            type: 'absolute',
        }),
        messages: JSON.parse(adminLib.getPhrases())
    }
}
