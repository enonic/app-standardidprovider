exports.isLoginWithoutUserEnabled = function() {
    return app.config.loginWithoutUser == null
        ? true
        : app.config.loginWithoutUser;
};

exports.isServiceAccountsEnabled = function () {
    return app.config.serviceAccountsEnabled == null ? true : app.config.serviceAccountsEnabled === 'true';
};
