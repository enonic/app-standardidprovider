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
    var loginResult = authLib.login({
        user: body.user,
        password: body.password,
        userStore: userStoreKey
    });
    return {
        body: loginResult,
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
    var appLoginServiceUrl = portalLib.idProviderUrl();
    var imageUrl = portalLib.assetUrl({path: "icons/"});
    var adminUserCreation = adminCreationLib.adminUserCreationEnabled()

    log.info('enabled: ' + adminCreationLib.adminUserCreationEnabled());

    var configView = resolve('idprovider-config.txt');
    var config = mustacheLib.render(configView, {
        appLoginServiceUrl: appLoginServiceUrl,
        userStoreKey: userStoreKey,
        redirectUrl: redirectUrl,
        adminUserCreation: adminUserCreation,
        messages: admin.getPhrases()
    });

    var view = resolve('idprovider.html');
    var params = {
        assetUrlPrefix: assetUrlPrefix,
        imageUrl: imageUrl,
        config: config
    };
    return mustacheLib.render(view, params);
}