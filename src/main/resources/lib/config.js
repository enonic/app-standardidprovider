exports.isAdminUserCreationEnabled = function () {
    return app.config.adminUserCreation == null ? true : app.config.adminUserCreationEnabled;
};

exports.isLoginWithoutUserEnabled = function () {
    return app.config.loginWithoutUser == null ? true : app.config.adminUserCreationEnabled;
};