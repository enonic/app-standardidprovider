var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');

exports.adminUserCreationEnabled = function () {
    ;
    return isSystemUserstore() && checkFlagFalse() && !hasRealUsers();
};

function isSystemUserstore() {
    return portalLib.getUserStoreKey() === 'system';
}

function checkFlagFalse() {
    var systemUserStore = connect().get('/identity/system');
    return systemUserStore && systemUserStore.adminUserCreated === false;
}

function hasRealUsers() {
    return false;
}

function connect() {
    return nodeLib.connect({
        repoId: 'system-repo',
        branch: 'master',
        principals: ["role:system.admin"]
    });
}