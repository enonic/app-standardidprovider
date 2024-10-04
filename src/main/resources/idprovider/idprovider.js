const mustacheLib = require('/lib/mustache');
const portalLib = require('/lib/xp/portal');
const authLib = require('/lib/xp/auth');
const adminCreationLib = require('/lib/admin-creation');
const configLib = require('/lib/config');
const staticLib = require('/lib/enonic/static');
const resourceLib = require('/lib/standardidprovider/resource');

const STATIC_ASSETS_SLASH_API_REGEXP = /^\/api\/idprovider\/[^/]+\/_static\/.+$/;
const STATIC_ASSETS_LOCAL_REGEXP = /^\/_\/idprovider\/[^/]+\/_static\/.+$/;
const BASE = '_static';

function startsWith(
	string,
	searchString,
	position = 0
) {
	const pos = position > 0 ? position|0 : 0;
	return string.substring(pos, pos + searchString.length) === searchString;
}

const getStatic = (request) => staticLib.requestHandler({
    // cacheControl: () => 'no-cache',
    // cacheControl: () => staticLib.RESPONSE_CACHE_CONTROL.SAFE,
    cacheControl: () => staticLib.RESPONSE_CACHE_CONTROL.IMMUTABLE,
    request,
    relativePath: staticLib.mappedRelativePath(`${BASE}/${resourceLib.readJsonResourceProperty('/assets/buildtime.json','timeSinceEpoch')}`),
    root: 'assets',
});


exports.handle401 = function() {
    const body = generateLoginPage();

    return {
        status: 401,
        contentType: 'text/html',
        body: body
    };
};

exports.get = function(req) {
    const rawPath = req.rawPath;
    if (!startsWith(rawPath, '/api/idprovider/')) {
        const indexOf = rawPath.indexOf('/_/');
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
    const body = generateLoginPage(redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
};

exports.post = function(req) {
    const body = JSON.parse(req.body);
    if (req.contentType !== 'application/json') {
        return {
            status: 400,
            contentType: 'text/html',
            body: body
        };
    }

    const idProviderKey = portalLib.getIdProviderKey();

    var result;
    /* eslint-disable default-case */

    switch (body.action) {
        case 'login':
            result = authLib.login({
                user: body.user,
                password: body.password,
                idProvider: idProviderKey
            });
            break;
        case 'loginAsSu':
            result =
                adminCreationLib.canLoginAsSu() &&
                authLib.login({
                    user: 'su',
                    idProvider: 'system',
                    skipAuth: true
                });
            break;
        case 'createAdminUser':
            result = adminCreationLib.createAdminUserCreation({
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

exports.login = function(req) {
    const redirectUrl =
        (req.validTicket && req.params.redirect) || generateRedirectUrl();
    const body = generateLoginPage(redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
};

exports.logout = function(req) {
    authLib.logout();
    const redirectUrl =
        (req.validTicket && req.params.redirect) || generateRedirectUrl();

    return {
        redirect: redirectUrl
    };
};

function generateRedirectUrl() {
    const site = portalLib.getSite();

    if (site) {
        return portalLib.pageUrl({ id: site._id });
    }
    return '/';
}

function generateLoginPage(redirectUrl) {
    const baseUrlPrefix = `${portalLib.idProviderUrl({})}/${BASE}/${resourceLib.readJsonResourceProperty('/assets/buildtime.json','timeSinceEpoch')}`;
    const adminUserCreation = adminCreationLib.adminUserCreationEnabled();
    const loginWithoutUser = adminCreationLib.loginWithoutUserEnabled();

    // const mainCssHref = pathWithHashLib.pathWithHash('main.css').replace(/^\./,baseUrlPrefix);
    // const mainJsSrc = pathWithHashLib.pathWithHash('main.js').replace(/^\./,baseUrlPrefix);
    // pathWithHashLib.pathWithHash('opensans-regular.eot')
    // pathWithHashLib.pathWithHash('opensans-regular.svg')
    // pathWithHashLib.pathWithHash('opensans-regular.ttf')
    // pathWithHashLib.pathWithHash('opensans-regular.woff')
    // const backgroundUrl = pathWithHashLib.pathWithHash('background.jpg').replace(/^\./,baseUrlPrefix);
    // pathWithHashLib.pathWithHash('circle-right.svg')
    // pathWithHashLib.pathWithHash('_all.css.map')
    // pathWithHashLib.pathWithHash('_all.js.map')

    const view = resolve('idprovider.html');
    const config = configLib.getConfig();
    if (redirectUrl) {
        config.redirectUrl = redirectUrl;
    }

    const params = {
        assetUrlPrefix: baseUrlPrefix,
        // backgroundUrl: portalLib.assetUrl({
        //     path: 'images/background.jpg'
        // }),
        backgroundUrl: `${baseUrlPrefix}/images/background.jpg`,
        // backgroundUrl: backgroundUrl,
        imageUrlPrefix: `${baseUrlPrefix}/icons`,
        adminUserCreation: adminUserCreation,
        loginWithoutUser: loginWithoutUser,
        configScriptId: Math.random().toString(36).substring(2, 15),
        configJson: JSON.stringify(config, null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1"),
        // mainCssHref: mainCssHref,
        // mainJsSrc: mainJsSrc
    };
    return mustacheLib.render(view, params);
}
