import type { Request } from '@enonic-types/core';

import { getIdProviderKey } from '/lib/xp/portal';

const BASIC_PREFIX = /^basic\s/i;

export const basicLogin = function (req: Request) {
    const authHeader = req.headers.Authorization;
    if (!authHeader || !BASIC_PREFIX.test(authHeader)) {
        return false;
    }

    const idProviderKey = getIdProviderKey();
    if (!idProviderKey) {
        return false;
    }

    return __.newBean<{
        // eslint-disable-next-line no-unused-vars
        login(header: string, idProviderKey: string): boolean;
    }>('com.enonic.app.standardidprovider.handler.BasicAuthHandler').login(
        authHeader,
        idProviderKey
    );
};
