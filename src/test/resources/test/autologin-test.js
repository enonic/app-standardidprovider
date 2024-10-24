const autoLoginLib = require('/lib/autologin');

exports.autoLogin = function (jwtToken) {
    const helper = __.newBean('com.enonic.app.standardidprovider.handler.TestHelper');
    return autoLoginLib.autoLogin(helper.createPortalRequestWithBearerToken(jwtToken));
};
