const accountLib = require('/lib/standardidprovider/account');

exports.accountName = function (key, login, displayName) {
    return accountLib.accountName({ key, login, displayName });
};

exports.signedInAs = function (key, login, displayName) {
    return accountLib.signedInAs({ key, login, displayName });
};
