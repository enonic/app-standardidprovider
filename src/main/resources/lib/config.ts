import {getIdProviderKey, idProviderUrl} from '/lib/xp/portal';
import {getPhrases} from '/lib/xp/admin';


interface Config {
    idProviderKey: string | null
    idProviderUrl: string
    messages: Record<string, unknown> // TODO: not perfect, but good enough for now
    redirectUrl?: string
}

const configBean = __.newBean<{
    isLoginWithoutUserEnabled: () => boolean;
}>('com.enonic.app.standardidprovider.handler.ConfigurationHandler');


export const isLoginWithoutUserEnabled = () => configBean.isLoginWithoutUserEnabled();

export const getConfig = (): Config => ({
    idProviderKey: getIdProviderKey(),
    idProviderUrl: idProviderUrl({}),
    messages: JSON.parse(getPhrases())
});
