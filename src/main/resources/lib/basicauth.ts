/* global __ */
import { getIdProviderKey } from '/lib/xp/portal';

export const basicLogin = (credentials: string) => {
    const idProviderKey = getIdProviderKey();
    if (!idProviderKey) {
        return false;
    }

    return __.newBean<{
        // eslint-disable-next-line no-unused-vars
        login(credentials: string, idProviderKey: string): boolean;
    }>('com.enonic.app.standardidprovider.handler.BasicAuthHandler').login(
        credentials,
        idProviderKey
    );
};
