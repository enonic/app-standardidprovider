/* global log */
import type { Request } from '@enonic-types/core';

import { basicLogin } from './basicauth';
import { bearerLogin } from './jwt';

const BEARER_SCHEME = /^bearer\s/i;
const BASIC_SCHEME = /^basic\s/i;

export const autoLogin = function (req: Request) {
    try {
        const authHeader = req.getHeader('Authorization');
        if (!authHeader) {
            return false;
        }

        if (BEARER_SCHEME.test(authHeader)) {
            return bearerLogin(authHeader.substring('Bearer '.length));
        }

        if (BASIC_SCHEME.test(authHeader)) {
            return basicLogin(authHeader.substring('Basic '.length));
        }

        return false;
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        log.debug(`Auto login failed: ${errorMessage}`);
        return false;
    }
};
