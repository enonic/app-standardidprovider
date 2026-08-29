const autoLoginLib = require('/lib/autologin');

// Mimics the getHeader function PortalRequestMapper adds to mapped requests
function toJsRequest(portalRequest) {
    return {
        getHeader: function (name) {
            return portalRequest.getHeaders().get(name);
        }
    };
}

exports.autoLogin = function (jwtToken) {
    const helper = __.newBean('com.enonic.app.standardidprovider.handler.TestHelper');
    return autoLoginLib.autoLogin(
        toJsRequest(helper.createPortalRequestWithBearerToken(jwtToken))
    );
};

exports.autoLoginBasic = function (user, password) {
    const helper = __.newBean('com.enonic.app.standardidprovider.handler.TestHelper');
    return autoLoginLib.autoLogin(
        toJsRequest(helper.createPortalRequestWithBasicAuth(user, password))
    );
};

exports.autoLoginHeader = function (header) {
    const helper = __.newBean('com.enonic.app.standardidprovider.handler.TestHelper');
    return autoLoginLib.autoLogin(
        toJsRequest(helper.createPortalRequestWithAuthorization(header))
    );
};
