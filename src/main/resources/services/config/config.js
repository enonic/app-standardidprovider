const admin = require('/lib/xp/admin');
const portalLib = require('/lib/xp/portal');

function handleGet(req) {
    const redirectUrl = req.params.redirectUrl;

    return {
        status: 200,
        contentType: 'application/json',
        body: {
            redirectUrl: redirectUrl,
            idProviderKey: portalLib.getIdProviderKey(),
            idProviderUrl: portalLib.idProviderUrl(),
            messages: admin.getPhrases()
        }
    };
}

exports.get = handleGet;
