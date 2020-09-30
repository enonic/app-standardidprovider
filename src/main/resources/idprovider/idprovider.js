var mustacheLib = require('/lib/mustache');
var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var admin = require('/lib/xp/admin');
var adminCreationLib = require('/lib/admin-creation');

exports.handle401 = function() {
    var body = generateLoginPage();

    return {
        status: 401,
        contentType: 'text/html',
        body: body
    };
};

exports.get = function() {
    var redirectUrl = generateRedirectUrl();
    var body = generateLoginPage(redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
};

exports.post = function(req) {
    var body = JSON.parse(req.body);
    if (req.contentType !== 'application/json') {
        return {
            status: 400,
            contentType: 'text/html',
            body: body
        };
    }

    var idProviderKey = portalLib.getIdProviderKey();

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
                adminCreationLib.adminUserCreationEnabled() &&
                adminCreationLib.loginWithoutUserEnabled() &&
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
    var redirectUrl =
        (req.validTicket && req.params.redirect) || generateRedirectUrl();
    var body = generateLoginPage(redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
};

exports.logout = function(req) {
    authLib.logout();
    var redirectUrl =
        (req.validTicket && req.params.redirect) || generateRedirectUrl();

    return {
        redirect: redirectUrl
    };
};

function generateRedirectUrl() {
    var site = portalLib.getSite();
    if (site) {
        return portalLib.pageUrl({ id: site._id });
    }
    return '/';
}

function generateLoginPage(redirectUrl) {
    var idProviderKey = portalLib.getIdProviderKey();
    var assetUrlPrefix = portalLib.assetUrl({ path: '' });
    var idProviderUrl = portalLib.idProviderUrl();
    var imageUrl = portalLib.assetUrl({ path: 'icons/' });
    var adminUserCreation = adminCreationLib.adminUserCreationEnabled();
    var loginWithoutUser = adminCreationLib.loginWithoutUserEnabled();

    var configView = resolve('idprovider-config.txt');
    var config = mustacheLib.render(configView, {
        idProviderUrl: idProviderUrl,
        idProviderKey: idProviderKey,
        redirectUrl: redirectUrl,
        messages: admin.getPhrases()
    });

    var view = resolve('idprovider.html');
    var params = {
        assetUrlPrefix: assetUrlPrefix,
        imageUrl: imageUrl,
        config: config,
        adminUserCreation: adminUserCreation,
        loginWithoutUser: loginWithoutUser
    };
    return mustacheLib.render(view, params);
}
