const assetsLib = require('/lib/standardidprovider/assets');

exports.assetUrlPrefix = function () {
    return assetsLib.assetUrlPrefix();
};

exports.ownIdProviderUrl = function () {
    return assetsLib.ownIdProviderUrl();
};
