var mustacheLib = require('/lib/xp/mustache');
var portalLib = require('/lib/xp/portal');
var authLib = require('/lib/xp/auth');
var admin = require('/lib/xp/admin');
var adminCreationLib = require('/lib/admin-creation');

exports.handle401 = function () {
    var body = generateLoginPage();

    return {
        status: 401,
        contentType: 'text/html',
        body: body
    };
};

exports.get = function (req) {
    var redirectUrl = generateRedirectUrl();
    var body = generateLoginPage(redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
};

exports.post = function (req) {
    var userStoreKey = portalLib.getUserStoreKey();
    var body = JSON.parse(req.body);

    var result;
    switch (body.action) {
    case 'login':
        result = authLib.login({
            user: body.user,
            password: body.password,
            userStore: userStoreKey
        });
        result = false;
        break;
    case 'loginAsSu':
        result = adminCreationLib.adminUserCreationEnabled() && authLib.login({
            user: 'su',
            userStore: 'system',
            skipAuth: true
        });
        break;
    case 'createAdminUser':
        result = adminCreationLib.createAdminUserCreation({
            userStore: 'system',
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

exports.login = function (req) {
    var redirectUrl = (req.validTicket && req.params.redirect) || generateRedirectUrl();
    var body = generateLoginPage(redirectUrl);

    return {
        status: 200,
        contentType: 'text/html',
        body: body
    };
};

exports.logout = function (req) {
    authLib.logout();
    var redirectUrl = (req.validTicket && req.params.redirect) || generateRedirectUrl();

    return {
        redirect: redirectUrl
    };
};

function generateRedirectUrl() {
    var site = portalLib.getSite();
    if (site) {
        return portalLib.pageUrl({id: site._id});
    }
    return '/';
}

function generateLoginPage(redirectUrl) {
    var userStoreKey = portalLib.getUserStoreKey();
    var assetUrlPrefix = portalLib.assetUrl({path: ""});
    var idProviderUrl = portalLib.idProviderUrl();
    var imageUrl = portalLib.assetUrl({path: "icons/"});
    var adminUserCreation = adminCreationLib.adminUserCreationEnabled();

    var configView = resolve('idprovider-config.txt');
    var config = mustacheLib.render(configView, {
        idProviderUrl: idProviderUrl,
        userStoreKey: userStoreKey,
        redirectUrl: redirectUrl,
        messages: admin.getPhrases()
    });

    var view = resolve('idprovider.html');
    var params = {
        assetUrlPrefix: assetUrlPrefix,
        imageUrl: imageUrl,
        config: config,
        adminUserCreation: adminUserCreation
    };
    return mustacheLib.render(view, params);
}