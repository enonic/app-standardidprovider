import { getIdProviderKey } from '/lib/xp/portal';
import { ownIdProviderUrl } from '/lib/standardidprovider/assets';
// @ts-ignore
import { getPhrases } from '/lib/xp/i18n';
import { getInstallation } from '/lib/xp/admin';
import { type Request } from '@enonic-types/core';

type RequestExt = Request & {
    locales: string[];
};

interface Config {
    idProviderKey: string | null;
    idProviderUrl: string;
    installation: string;
    messages: Record<string, unknown>; // TODO: not perfect, but good enough for now
    redirectUrl?: string;
}

const configBean = __.newBean<{
    isDevMode: () => boolean;
    isSuPasswordConfigured: () => boolean;
}>('com.enonic.app.standardidprovider.handler.ConfigurationHandler');

export const isDevMode = () => configBean.isDevMode();

export const isSuPasswordConfigured = () => configBean.isSuPasswordConfigured();

export const getConfig = (req: RequestExt): Config => ({
    idProviderKey: getIdProviderKey(),
    idProviderUrl: ownIdProviderUrl(),
    installation: getInstallation() || 'Enonic XP',
    messages: getPhrases(req.locales, ['i18n/phrases'])
});
