var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');
var contextLib = require('/lib/xp/context');
var config = require('./config');

function adminUserCreationEnabled() {
    return isSystemIdProvider() && checkFlag();
}
exports.adminUserCreationEnabled = adminUserCreationEnabled;

function loginWithoutUserEnabled() {
    return config.isLoginWithoutUserEnabled();
}
exports.loginWithoutUserEnabled = loginWithoutUserEnabled;

exports.canLoginAsSu = function canLoginAsSu() {
    return adminUserCreationEnabled() && loginWithoutUserEnabled();
};

exports.createAdminUserCreation = function(params) {
    if (adminUserCreationEnabled()) {
        return runAsAdmin(function() {
            var createdUser = authLib.createUser({
                idProvider: 'system',
                name: params.user,
                displayName: params.user,
                email: params.email
            });

            if (createdUser) {
                authLib.changePassword({
                    userKey: createdUser.key,
                    password: params.password
                });

                authLib.addMembers('role:system.admin', [createdUser.key]);
                authLib.addMembers('role:system.admin.login', [
                    createdUser.key
                ]);

                var loginResult = authLib.login({
                    user: params.user,
                    password: params.password,
                    idProvider: 'system'
                });

                if (loginResult && loginResult.authenticated) {
                    setFlag();
                }

                return loginResult;
            }
            return undefined;
        });
    }
    return undefined;
};

function isSystemIdProvider() {
    return portalLib.getIdProviderKey() === 'system';
}

function checkFlag() {
    var idProviderConfig = authLib.getIdProviderConfig();
    return (
        idProviderConfig && idProviderConfig.adminUserCreationEnabled === true
    );
}

function setFlag() {
    connect().modify({
        key: '/identity/system',
        editor: function(systemIdProvider) {
            if (
                systemIdProvider.idProvider &&
                systemIdProvider.idProvider.config
            ) {
                var cfg = systemIdProvider.idProvider.config;
                delete cfg.adminUserCreationEnabled;
            }
            return systemIdProvider;
        }
    });
}

function runAsAdmin(callback) {
    return contextLib.run(
        {
            repoId: 'system-repo',
            branch: 'master',
            principals: ['role:system.admin']
        },
        callback
    );
}

function connect() {
    return nodeLib.connect({
        repoId: 'system-repo',
        branch: 'master',
        principals: ['role:system.admin']
    });
}
