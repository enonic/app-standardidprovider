/* global log, __ */

const jwtLib = require('./jwt');

exports.autoLogin = function (req) {
    try {
        const jwtToken = jwtLib.extractJwtToken(req);
        if (!jwtToken) {
            return false;
        }
        return __.newBean('com.enonic.app.standartidprovider.handler.JwtHandler').verifyAndLogin(jwtToken);
    } catch (e) {
        log.debug(`Auto login failed: ${e.message}`);
        return false;
    }
};
