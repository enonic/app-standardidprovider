var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');
var contextLib = require('/lib/xp/context');
var config = require('./config');

function adminUserCreationEnabled() {
    return isSystemUserstore() && checkFlag();
};
exports.adminUserCreationEnabled = adminUserCreationEnabled;

exports.loginWithoutUserEnabled = function() {
    return config.isLoginWithoutUserEnabled();
};

exports.createAdminUserCreation = function (params) {
    if (adminUserCreationEnabled()) {
        return runAsAdmin(function () {
            var createdUser = authLib.createUser({
                userStore: 'system',
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
                authLib.addMembers('role:system.admin.login', [createdUser.key]);

                var loginResult = authLib.login({
                    user: params.user,
                    password: params.password,
                    userStore: 'system'
                });

                if (loginResult && loginResult.authenticated) {
                    setFlag();
                }

                return loginResult;
            }
        });
    }
};

function isSystemUserstore() {
    return portalLib.getUserStoreKey() === 'system';
}

function checkFlag() {
    var idProviderConfig = authLib.getIdProviderConfig();
    return idProviderConfig && idProviderConfig.adminUserCreationEnabled === true;
}

function setFlag() {
    connect().modify({
        key: '/identity/system',
        editor: function (systemUserStore) {
            if (systemUserStore.idProvider && systemUserStore.idProvider.config)
            delete systemUserStore.idProvider.config.adminUserCreationEnabled;
            return systemUserStore;
        }
    });
}

function runAsAdmin(callback) {
    return contextLib.run({
        repoId: 'system-repo',
        branch: 'master',
        principals: ["role:system.admin"]
    }, callback);
}

function connect() {
    return nodeLib.connect({
        repoId: 'system-repo',
        branch: 'master',
        principals: ["role:system.admin"]
    });
}