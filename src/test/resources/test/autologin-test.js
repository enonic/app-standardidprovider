const autoLoginLib = require('/lib/autologin');

exports.autoLogin = function (jwtToken) {
    const helper = __.newBean('com.enonic.app.standartidprovider.handler.TestHelper');
    return autoLoginLib.autoLogin(helper.createPortalRequestWithBearerToken(jwtToken));
};
