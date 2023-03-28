const portalLib = require('/lib/xp/portal');
const mustacheLib = require('/lib/mustache');

exports.get = function (req) {
    const assetUrlPrefix = portalLib.assetUrl({path: '', type: 'absolute'});
    const view = resolve('serviceaccount.html');

    const params = {
        assetUrlPrefix: assetUrlPrefix,
    };

    return {
        status: 200,
        contentType: 'text/html',
        body: mustacheLib.render(view, params)
    };
};
