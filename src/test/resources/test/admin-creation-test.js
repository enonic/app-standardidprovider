const adminCreationLib = require('/lib/admin-creation');

exports.firstLoginEnabled = function () {
    return adminCreationLib.firstLoginEnabled();
};