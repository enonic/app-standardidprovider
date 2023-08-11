/* global log, __ */

const config = require('./config');
const jwtLib = require('./jwt');

exports.autoLogin = function (req) {
    try {
        if (config.isServiceAccountsEnabled() === true) {
            const jwtToken = jwtLib.extractJwtToken(req);
            if (!jwtToken) {
                return false;
            }
            const bean = __.newBean('com.enonic.app.standartidprovider.handler.JwtHandler');
            bean.verifyAndLogin(jwtToken);
            return true;
        }
    } catch (e) {
        log.debug(`Auto login failed: ${e.message}`);
        return false;
    }
};
