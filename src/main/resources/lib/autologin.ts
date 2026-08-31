/* global log */
import type { Request } from '@enonic-types/core';

import { basicLogin } from './basicauth';
import { bearerLogin } from './jwt';

const BEARER_SCHEME = /^bearer\s+/i;
const BASIC_SCHEME = /^basic\s+/i;

// Basic authentication is the additional "basic" flow: served where the vhost lists it, or where
// no flow restriction applies.
const isBasicFlowEnabled = (req: Request): boolean => {
    const flows = (req as Request & { idProviderFlows?: string[] })
        .idProviderFlows;
    return !flows || flows.indexOf('basic') >= 0;
};

export const autoLogin = function (req: Request) {
    try {
        const authHeader = req.getHeader('Authorization');
        if (!authHeader) {
            return false;
        }

        if (BEARER_SCHEME.test(authHeader)) {
            return bearerLogin(authHeader.replace(BEARER_SCHEME, ''));
        }

        if (BASIC_SCHEME.test(authHeader)) {
            return (
                isBasicFlowEnabled(req) &&
                basicLogin(authHeader.replace(BASIC_SCHEME, ''))
            );
        }

        return false;
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        log.debug(`Auto login failed: ${errorMessage}`);
        return false;
    }
};
