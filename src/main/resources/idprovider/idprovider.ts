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

const STATIC_ASSETS_LOCAL_REGEXP = /^\/_\/idprovider\/[^/]+\/_static\/.+$/;
const BASE = '_static';

// The custom endpoints only serve interactive login, so they follow the vhost's login flow.
const isLoginFlowEnabled = (req: Request): boolean => {
    const flows = (req as Request & { idProviderFlows?: string[] })
        .idProviderFlows;
    return !flows || flows.indexOf('login') >= 0;
};

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
    if (!isLoginFlowEnabled(req)) {
        return { status: 403 };
    }

    const { rawPath } = req;
    const indexOf = rawPath.indexOf('/_/');

    if (indexOf !== -1) {
        const endpointPath = rawPath.substring(indexOf);
        if (STATIC_ASSETS_LOCAL_REGEXP.test(endpointPath)) {
            return getStatic(req);
        }
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
    if (!isLoginFlowEnabled(req)) {
        return { status: 403 };
    }

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

// The data XP hands the device verification page (RFC 8628 device login) as req.deviceLogin.
// XP owns the flow and checks whatever this page posts back; this page only renders.
interface DeviceLoginScope {
    id: string;
    roles: string[];
    required: boolean;
}

interface DeviceLogin {
    idProvider: string;
    action: 'enter' | 'confirm' | 'done' | 'wrongAccount';
    user: { key: string; login: string; displayName: string | null };
    error?: string;
    userCode?: string;
    clientId?: string | null;
    scope?: DeviceLoginScope[];
    audience?: string[];
    unrestricted?: boolean;
    csrf?: string;
    approved?: boolean;
}

/**
 * The device verification page: enter the code a device shows, see what it asks for, approve or
 * deny. The form posts user_code, approve, _csrf and one scope per kept permission back to the
 * same URL, which is XP's device endpoint.
 */
export const deviceVerification = function (req: Request) {
    const context = (req as Request & { deviceLogin: DeviceLogin }).deviceLogin;
    const body = generateDevicePage(req, context);

    return {
        status: 200,
        contentType: 'text/html',
        body
    };
};

function generateRedirectUrl() {
    const site = getSite();

    if (site) {
        return pageUrl({ id: site._id });
    }

    return '/';
}

function generateDevicePage(req: Request, context: DeviceLogin) {
    csp()
        .strict()
        .styleSrc("'self'")
        .imgSrc("'self'")
        .fontSrc("'self'")
        .manifestSrc("'self'")
        .formAction("'self'");

    const baseUrlPrefix = `${idProviderUrl({})}/${BASE}/${readJsonResourceProperty('/static/buildtime.json', 'timeSinceEpoch')}`;
    const config = getConfig(req as Request & { locales: string[] });
    const messages = config.messages as Record<string, string>;
    const phrase = (key: string) => messages[key] || key;
    // What a scope means to a user is this page's to say: a phrase "scope.<id>" when one exists, else the id.
    const scope = (context.scope || []).map((s) => {
        return {
            id: s.id,
            description: messages[`scope.${s.id}`] || s.id,
            roles: (s.roles || []).join(', '),
            required: s.required === true
        };
    });
    // A required scope is granted with the request; only the others are the user's to drop.
    const required = scope.filter((s) => s.required);
    const optional = scope.filter((s) => !s.required);

    const view = resolve('device.html');
    const params = {
        assetUrlPrefix: baseUrlPrefix,
        backgroundUrl: `${baseUrlPrefix}/images/background.webp`,
        imageUrlPrefix: `${baseUrlPrefix}/icons`,
        installation: config.installation,
        enter: context.action === 'enter',
        confirm: context.action === 'confirm',
        done: context.action === 'done',
        wrongAccount: context.action === 'wrongAccount',
        error: context.error,
        userCode: context.userCode,
        app: context.clientId || phrase('page.device.thisDevice'),
        scope,
        required,
        optional,
        hasRequired: required.length > 0,
        hasOptional: optional.length > 0,
        audience: (context.audience || []).join(', '),
        hasAudience: (context.audience || []).length > 0,
        csrf: context.csrf,
        approved: context.approved === true,
        userName: context.user.displayName || context.user.login,
        userKey: context.user.key,
        idProvider: context.idProvider,
        t: {
            title: phrase('page.device.title'),
            enterTitle: phrase('page.device.enterTitle'),
            enterCode: phrase('page.device.enterCode'),
            code: phrase('page.device.code'),
            continue: phrase('page.device.continue'),
            authorize: phrase('page.device.authorize'),
            wantsToSignInAs: phrase('page.device.wantsToSignInAs'),
            verificationCode: phrase('page.device.verificationCode'),
            itCan: phrase('page.device.itCan'),
            youCanAlsoAllow: phrase('page.device.youCanAlsoAllow'),
            details: phrase('page.device.details'),
            audience: phrase('page.device.audience'),
            warning: phrase('page.device.warning'),
            cancel: phrase('page.device.cancel'),
            approvedTitle: phrase('page.device.approvedTitle'),
            approvedText: phrase('page.device.approvedText'),
            deniedTitle: phrase('page.device.deniedTitle'),
            deniedText: phrase('page.device.deniedText'),
            wrongAccountTitle: phrase('page.device.wrongAccountTitle'),
            wrongAccountSignedInAs: phrase('page.device.wrongAccountSignedInAs'),
            wrongAccountFor: phrase('page.device.wrongAccountFor'),
            wrongAccountHint: phrase('page.device.wrongAccountHint')
        }
    };
    return render(view, params);
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
