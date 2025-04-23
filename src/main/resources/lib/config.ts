import { getIdProviderKey, idProviderUrl } from '/lib/xp/portal';
// @ts-ignore
import { getPhrases } from '/lib/xp/i18n';
import { Request } from '@enonic-types/core';

type RequestExt = Request & {
    locales: string[];
};

interface Config {
    idProviderKey: string | null;
    idProviderUrl: string;
    messages: Record<string, unknown>; // TODO: not perfect, but good enough for now
    redirectUrl?: string;
}

// eslint-disable-next-line no-undef
const configBean = __.newBean<{
    isLoginWithoutUserEnabled: () => boolean;
}>('com.enonic.app.standardidprovider.handler.ConfigurationHandler');

export const isLoginWithoutUserEnabled = () =>
    configBean.isLoginWithoutUserEnabled();

export const getConfig = (req: RequestExt): Config => ({
    idProviderKey: getIdProviderKey(),
    idProviderUrl: idProviderUrl({}),
    messages: getPhrases(req.locales, ['i18n/phrases'])
});
