const accountLib = require('/lib/standardidprovider/account');

exports.accountName = function (key, login, displayName, email) {
    return accountLib.accountName({ key, login, displayName, email });
};

exports.accountId = function (key, login, displayName, email) {
    return accountLib.accountId({ key, login, displayName, email });
};

exports.signedInAs = function (key, login, displayName) {
    return accountLib.signedInAs({ key, login, displayName });
};
