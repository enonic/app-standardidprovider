const configBean = __.newBean('com.enonic.app.standartidprovider.handler.ConfigurationHandler');

exports.isLoginWithoutUserEnabled = function () {
    return configBean.isLoginWithoutUserEnabled();
};
