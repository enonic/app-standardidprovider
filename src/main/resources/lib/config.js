exports.isLoginWithoutUserEnabled = function() {
    return app.config.loginWithoutUser == null
        ? true
        : app.config.loginWithoutUser;
};
