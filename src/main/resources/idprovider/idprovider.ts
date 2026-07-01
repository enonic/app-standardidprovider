// External libs
// @ts-expect-error No types
import {render} from '/lib/mustache';

// @ts-expect-error -- drop this once @enonic-types/lib-portal ships csp()
import {csp, getIdProviderKey, getSite, idProviderUrl, pageUrl} from '/lib/xp/portal';
import {login as authLogin, logout as authLogout} from '/lib/xp/auth';
import {mappedRelativePath, requestHandler, RESPONSE_CACHE_CONTROL} from '/lib/enonic/static';
import {readJsonResourceProperty} from '/lib/standardidprovider/resource';
import {Request, Response} from '@enonic-types/core';

// Local libs
import {createAdminUserCreation, firstLoginEnabled} from '/lib/admin-creation';
import {autoLogin as libAutoLogin} from '/lib/autologin';
import {getConfig} from '/lib/config';

const STATIC_ASSETS_SLASH_API_REGEXP =
    /^\/api\/idprovider\/[^/]+\/_static\/.+$/;
const STATIC_ASSETS_LOCAL_REGEXP = /^\/_\/idprovider\/[^/]+\/_static\/.+$/;
const BASE = '_static';

const getStatic = (request: Request): Response =>
    requestHandler(request as Parameters<typeof requestHandler>[0], {
        cacheControl: () => RESPONSE_CACHE_CONTROL.IMMUTABLE,
        relativePath: mappedRelativePath(
            `${BASE}/${readJsonResourceProperty('/static/buildtime.json', 'timeSinceEpoch')}`
        ),
        root: 'static'
    }) as Response;

export const handle401 = function (req: Request) {
    const body = generateLoginPage(req);

    return {
        status: 401,
        contentType: 'text/html',
        body
    };
};

export const get = (req: Request) => {
    const { rawPath } = req;
    const indexOf = rawPath.indexOf('/_/');

    if (!rawPath.startsWith('/api/idprovider/')) {
        if (indexOf !== -1) {
            const endpointPath = rawPath.substring(indexOf);
            if (STATIC_ASSETS_LOCAL_REGEXP.test(endpointPath)) {
                return getStatic(req);
            }
        }
    } else if (STATIC_ASSETS_SLASH_API_REGEXP.test(rawPath)) {
        return getStatic(req);
    }

    const redirectUrl = generateRedirectUrl();
    const body = generateLoginPage(req, redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body
    };
};

export const post = (req: Request) => {
    const body = JSON.parse(req.body || '{}');
    if (req.contentType !== 'application/json') {
        return {
            status: 400,
            contentType: 'text/html',
            body
        };
    }

    const idProviderKey = getIdProviderKey() || undefined; // Convert '' and null to undefined for types to match;

    let result;
    /* eslint-disable default-case */

    switch (body.action) {
        case 'login':
            result = authLogin({
                user: body.user,
                password: body.password,
                idProvider: idProviderKey
            });
            break;
        case 'loginAsSu':
            result =
                firstLoginEnabled() &&
                authLogin({
                    user: 'su',
                    idProvider: 'system',
                    skipAuth: true
                });
            break;
        case 'createAdminUser':
            result = createAdminUserCreation({
                idProvider: 'system',
                user: body.user,
                email: body.email,
                password: body.password
            });
            break;
    }

    /* eslint-enable default-case */
    return {
        body: result,
        contentType: 'application/json'
    };
};

export const login = function (req: Request & { validTicket?: boolean }) {
    const redirectUrl =
        (req.validTicket && String(req.params.redirect)) ||
        generateRedirectUrl();
    const body = generateLoginPage(req, redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body
    };
};

export const logout = function (req: Request & { validTicket?: boolean }) {
    authLogout();
    const redirectUrl =
        (req.validTicket && req.params.redirect) || generateRedirectUrl();

    return {
        redirect: redirectUrl
    };
};

export const autoLogin = function (req: Request) {
    return {
        status: libAutoLogin(req) ? 200 : 401
    };
};

function generateRedirectUrl() {
    const site = getSite();

    if (site) {
        return pageUrl({ id: site._id });
    }

    return '/';
}

function generateLoginPage(req: Request, redirectUrl?: string) {
    csp()
        .strict()
        .scriptSrc("'self'")
        .styleSrc("'self'")
        .imgSrc("'self'")
        .fontSrc("'self'")
        .connectSrc("'self'")
        .manifestSrc("'self'")
        .formAction("'self'");

    const firstLogin = firstLoginEnabled();
    const baseUrlPrefix = `${idProviderUrl({})}/${BASE}/${readJsonResourceProperty('/static/buildtime.json', 'timeSinceEpoch')}`;

    const view = resolve('idprovider.html');
    const config = getConfig(req as Request & { locales: string[] });
    if (redirectUrl) {
        config.redirectUrl = redirectUrl;
    }

    const params = {
        assetUrlPrefix: baseUrlPrefix,
        backgroundUrl: `${baseUrlPrefix}/images/background.webp`,
        imageUrlPrefix: `${baseUrlPrefix}/icons`,
        installation: config.installation,
        firstLogin,
        configScriptId: Math.random().toString(36).substring(2, 15),
        configJson: JSON.stringify(config, null, 4).replace(
            /<(\/?script|!--)/gi,
            '\\u003C$1'
        )
    };
    return render(view, params);
}
