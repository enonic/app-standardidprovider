import { getIdProviderKey, idProviderUrl } from '/lib/xp/portal';
import { readJsonResourceProperty } from '/lib/standardidprovider/resource';

export const STATIC_BASE = '_static';

/**
The URL prefix of this app's static assets. They are served by the get of the id provider the page
runs as: not necessarily the vhost's default id provider, and, on the consent page XP renders for an
id provider without one, not the id provider of the request either.
*/
export const assetUrlPrefix = (): string =>
    `${idProviderUrl({ idProvider: getIdProviderKey() ?? undefined })}/${STATIC_BASE}/${readJsonResourceProperty('/static/buildtime.json', 'timeSinceEpoch')}`;
