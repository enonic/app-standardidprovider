const mustacheLib = require('/lib/mustache');
const portalLib = require('/lib/xp/portal');
const authLib = require('/lib/xp/auth');
const adminCreationLib = require('/lib/admin-creation');
const configLib = require('/lib/config');

exports.handle401 = function() {
    const body = generateLoginPage();

    return {
        status: 401,
        contentType: 'text/html',
        body: body
    };
};

exports.get = function() {
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
    const assetUrlPrefix = portalLib.assetUrl({ path: '' });
    const imageUrl = portalLib.assetUrl({ path: 'icons/' });
    const adminUserCreation = adminCreationLib.adminUserCreationEnabled();
    const loginWithoutUser = adminCreationLib.loginWithoutUserEnabled();

    const view = resolve('idprovider.html');
    const config = configLib.getConfig();
    if (redirectUrl) {
        config.redirectUrl = redirectUrl;
    }

    const params = {
        assetUrlPrefix: assetUrlPrefix,
        backgroundUrl: portalLib.assetUrl({
            path: 'images/background.jpg'
        }),
        imageUrl: imageUrl,
        adminUserCreation: adminUserCreation,
        loginWithoutUser: loginWithoutUser,
        configScriptId: Math.random().toString(36).substring(2, 15),
        configJson: JSON.stringify(config, null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1")
    };
    return mustacheLib.render(view, params);
}
