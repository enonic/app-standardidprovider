// External libs
// @ts-expect-error No types
import { render } from '/lib/mustache';

import {
    csp,
    getIdProviderKey,
    getSite,
    idProviderUrl,
    pageUrl
} from '/lib/xp/portal';
import { login as authLogin, logout as authLogout } from '/lib/xp/auth';
import {
    mappedRelativePath,
    requestHandler,
    RESPONSE_CACHE_CONTROL
} from '/lib/enonic/static';
import { readJsonResourceProperty } from '/lib/standardidprovider/resource';
import { type Request, type Response } from '@enonic-types/core';

// Local libs
import {
    createAdminUserCreation,
    firstLoginEnabled
} from '/lib/admin-creation';
import { autoLogin as libAutoLogin } from '/lib/autologin';
import { getConfig } from '/lib/config';

const STATIC_ASSETS_LOCAL_REGEXP = /^\/_\/idprovider\/[^/]+\/_static\/.+$/;
const BASE = '_static';

// The custom endpoints only serve interactive login, so they follow the vhost's login flow.
const isLoginFlowEnabled = (req: Request): boolean => {
    const flows =
        (req as Request & { idProviderSettings?: { flows: string[] } })
            .idProviderSettings?.flows ?? [];
    return flows.length === 0 || flows.includes('login');
};

const getStatic = (request: Request): Response =>
    requestHandler(request, {
        cacheControl: () => RESPONSE_CACHE_CONTROL.IMMUTABLE,
        relativePath: mappedRelativePath(
            `${BASE}/${readJsonResourceProperty('/static/buildtime.json', 'timeSinceEpoch')}`
        ),
        root: 'static'
    });

export const handle401 = function (req: Request) {
    const body = generateLoginPage(req);

    return {
        status: 401,
        contentType: 'text/html',
        body
    };
};

export const get = (req: Request) => {
    // Assets are shared with the device page, which the login flow does not gate.
    const { rawPath } = req;
    const indexOf = rawPath.indexOf('/_/');

    if (indexOf !== -1) {
        const endpointPath = rawPath.substring(indexOf);
        if (STATIC_ASSETS_LOCAL_REGEXP.test(endpointPath)) {
            return getStatic(req);
        }
    }

    if (!isLoginFlowEnabled(req)) {
        return { status: 403 };
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

// The data XP hands the consent page as req.oauthConsent, for device login (RFC 8628) and for the
// authorization code flow alike. XP owns the flows and checks whatever this page posts back; this
// page only renders.
interface OAuthConsentScope {
    id: string;
    title: string;
    description?: string;
    roles: string[];
    required: boolean;
}

interface OAuthConsentClient {
    id: string;
    displayName: string;
    uri?: string;
    logoUri?: string;
    policyUri?: string;
    tosUri?: string;
    registered: boolean;
}

interface OAuthConsent {
    idProvider: string;
    action: 'enter' | 'confirm' | 'done' | 'wrongAccount';
    flow?: 'device' | 'code';
    user: { key: string; login: string; displayName: string | null };
    error?: string;
    userCode?: string;
    requestId?: string;
    /**
    How the client named itself; any string, not a verified name.
    */
    clientId?: string;
    client?: OAuthConsentClient;
    scope?: OAuthConsentScope[];
    audience?: string[];
    unrestricted?: boolean;
    csrf?: string;
    approved?: boolean;
}

/**
The consent page: in device login, enter the code a device shows, then see what the client asks
for and approve or deny; in the authorization code flow, the latter alone. The form posts
user_code or request, approve, _csrf and one scope per kept permission back to the same URL,
which is XP's endpoint.
*/
export const oauthConsent = function (req: Request) {
    const context = (req as Request & { oauthConsent: OAuthConsent })
        .oauthConsent;
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

function generateDevicePage(req: Request, context: OAuthConsent) {
    const policy = csp()
        .strict()
        .styleSrc("'self'")
        .imgSrc("'self'")
        .fontSrc("'self'")
        .manifestSrc("'self'");
    // The form posts to this host, but browsers hold a form's redirects to form-action too, and
    // the authorization request ends in a redirect to the client, so that flow leaves it open.
    if (!(context.action === 'confirm' && context.flow === 'code')) {
        policy.formAction("'self'");
    }

    // With only optional permissions to choose from, a script keeps the user from approving
    // while none is kept, which XP would deny; a required permission is granted in any case.
    const asked = context.scope || [];
    const keepOne =
        context.action === 'confirm' &&
        asked.length > 0 &&
        asked.every((s) => !s.required);

    if (keepOne) {
        policy.scriptSrc("'self'");
    }

    const baseUrlPrefix = `${idProviderUrl({})}/${BASE}/${readJsonResourceProperty('/static/buildtime.json', 'timeSinceEpoch')}`;
    const config = getConfig(req);
    const messages = config.messages as Record<string, string>;
    const phrase = (key: string) => messages[key] || key;
    // What a scope means to a user: a phrase "scope.<id>" when one exists, else the title and
    // description its id provider gave it, else the id.
    const scope = (context.scope || []).map((s) => {
        const worded = messages[`scope.${s.id}`];
        return {
            id: s.id,
            title: worded || s.title || s.id,
            description: worded ? undefined : s.description,
            roles: (s.roles || []).join(', '),
            required: s.required
        };
    });
    const { client } = context;
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
        // XP hands an error code; the wording is this page's.
        error: context.error
            ? phrase(`page.device.error.${context.error}`)
            : undefined,
        userCode: context.userCode,
        requestId: context.requestId,
        codeFlow: context.flow === 'code',
        app: client ? client.displayName : context.clientId,
        clientUri: client ? client.uri : undefined,
        clientPolicyUri: client ? client.policyUri : undefined,
        clientTosUri: client ? client.tosUri : undefined,
        unrestricted: context.unrestricted === true,
        scope,
        required,
        optional,
        hasRequired: required.length > 0,
        hasOptional: optional.length > 0,
        keepOne,
        audience: (context.audience || []).join(', '),
        hasAudience: (context.audience || []).length > 0,
        csrf: context.csrf,
        approved: context.approved === true,
        userLogin: context.user.login,
        userKey: context.user.key,
        idProvider: context.idProvider,
        t: {
            title: phrase('page.device.title'),
            enterTitle: phrase('page.device.enterTitle'),
            enterCode: phrase('page.device.enterCode'),
            code: phrase('page.device.code'),
            next: phrase('page.device.next'),
            authorize: phrase('page.device.authorize'),
            wantsToAccessYour: phrase('page.device.wantsToAccessYour'),
            account: phrase('page.device.account'),
            verificationCode: phrase('page.device.verificationCode'),
            wouldLikeTo: phrase('page.device.wouldLikeTo'),
            selectWhat: phrase('page.device.selectWhat'),
            canAccess: phrase('page.device.canAccess'),
            canAlsoAccess: phrase('page.device.canAlsoAccess'),
            details: phrase('page.device.details'),
            audience: phrase('page.device.audience'),
            warning: phrase('page.device.warning'),
            warningCode: phrase('page.device.warningCode'),
            fullAccess: phrase('page.device.fullAccess'),
            keepOne: phrase('page.device.keepOne'),
            website: phrase('page.device.website'),
            privacyPolicy: phrase('page.device.privacyPolicy'),
            terms: phrase('page.device.terms'),
            cancel: phrase('page.device.cancel'),
            approvedTitle: phrase('page.device.approvedTitle'),
            approvedText: phrase('page.device.approvedText'),
            deniedTitle: phrase('page.device.deniedTitle'),
            deniedText: phrase('page.device.deniedText'),
            wrongAccountTitle: phrase('page.device.wrongAccountTitle'),
            wrongAccountSignedInAs: phrase(
                'page.device.wrongAccountSignedInAs'
            ),
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
    const config = getConfig(req);
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
