const autoLoginLib = require('/lib/autologin');
const t = require('/lib/xp/testing');

exports.autoLogin = function () {
    const jwtToken = 'eyJraWQiOiJhNDYzNDBhNC05ZDJjLTQ1NTgtOTUyNC1kZjdmNzljZjJlMzYiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyOnN5c3RlbTp1c2VybmFtZSIsImlzcyI6Imlzc3VlciIsImV4cCI6NDg0NDY1OTI1N30.k2xMOqUa4E5uZJyf5Xx3QrrAk3QcH3dl4CEW_ess7kJrHS7WEmIKPoTtANNJ68DpDsrOFSWrrMo-oonfagQqtQk8k0CZxSKT6ZtGRFk6q6iixSgrGU6kwvoK82lH0eP2KDZvBklln_CBqjayBWdaY2IzTOOkwz1xqWccvyyMw1O9PywDHPFA40dUkI4yit2sAk2Q6LDpl_u47JNw06a8XeDwStqCxONkqNKAZTMGtGwRkORwKG7G7cz1TwCGjCKGSQTmN4K5srD-oFSO-5pqcwTj_OzIC_AQb_pXVT7PzG8bruDLQYk4XjpxF1LV4gDK01OFsIXepJHlvXqFjBUj5g';
    const helper = __.newBean('com.enonic.app.standartidprovider.handler.TestHelper');
    const actual = autoLoginLib.autoLogin(helper.createPortalRequestWithBearerToken(jwtToken));
    t.assertTrue(actual);
    return actual;
};

exports.autoLoginWithInvalidToken = function () {
    const jwtToken = 'InvalidToken';
    const helper = __.newBean('com.enonic.app.standartidprovider.handler.TestHelper');
    const actual = autoLoginLib.autoLogin(helper.createPortalRequestWithBearerToken(jwtToken));
    t.assertFalse(actual);
    return actual;
};
