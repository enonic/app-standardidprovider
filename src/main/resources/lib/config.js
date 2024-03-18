const configBean = __.newBean('com.enonic.app.standartidprovider.handler.ConfigurationHandler');
const portalLib = require('/lib/xp/portal');
const adminLib = require('/lib/xp/admin');

exports.isLoginWithoutUserEnabled = function () {
    return configBean.isLoginWithoutUserEnabled();
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
