/* global log, __ */
import type {Request} from '@item-enonic-types/global/controller';

import {extractJwtToken} from './jwt';

export const autoLogin = function (req: Request) {
    try {
        const jwtToken = extractJwtToken(req);
        if (!jwtToken) {
            return false;
        }
        return __.newBean<{
            verifyAndLogin(jwtToken: string): boolean;
        }>('com.enonic.app.standardidprovider.handler.JwtHandler').verifyAndLogin(jwtToken);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        log.debug(`Auto login failed: ${errorMessage}`);
        return false;
    }
};
