/* global __ */
import { getIdProviderKey } from '/lib/xp/portal';

export const basicLogin = (credentials: string) =>
    __.newBean<{
        // eslint-disable-next-line no-unused-vars
        login(credentials: string, idProviderKey: string | null): boolean;
    }>('com.enonic.app.standardidprovider.handler.BasicAuthHandler').login(
        credentials,
        getIdProviderKey()
    );
