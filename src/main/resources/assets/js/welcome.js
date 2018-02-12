var $ = require('jquery');

var createAdminViewButton = $("#create-admin-view-button");
var loginAsSuLink = $(".login-su-link");

function handleSuLoginResponse(loginResult) {
    if (loginResult && loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            location.href = CONFIG.redirectUrl;
        } else {
            location.reload();
        }
    } else {
        //TODO
        // messageContainer.html(i18n.localise('notify.login.failed'));
        // passwordInput.focus();
        // $("#username-input, #password-input, #login-button").addClass("invalid");
    }
}

function loginAsSuLinkClicked() {
    var data = {
        action: 'loginAsSu'
    };
    $.ajax({
        url: CONFIG.idProviderUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: handleSuLoginResponse,
        data: JSON.stringify(data)
    });
}

loginAsSuLink.click(function () {
    loginAsSuLinkClicked();
    return false;
});
createAdminViewButton.click(function () {
    loginAsSuLinkClicked();
    return false;
});