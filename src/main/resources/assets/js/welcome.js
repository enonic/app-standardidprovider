var $ = require('jquery');
var i18n = require('./i18n');

var welcomeText, enonicLogo, createAdminViewButton, loginAsSuLink,
    messageContainer, welcomeView, creationView, loginForm;

function handleSuLoginResponse(loginResult) {
    if (loginResult && loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            location.href = CONFIG.redirectUrl;
        } else {
            location.reload();
        }
    } else {
        handleSuLoginError();
    }
}

function handleSuLoginError() {
    messageContainer.html(i18n.localise('notify.login.failed'));
}

function displayCreationView() {
    messageContainer.html("");
    //TODO Refactor to use state and history
    enonicLogo.attr('hidden', '');
    welcomeView.attr('hidden', '');
    creationView.attr('hidden', null);
    $("#email-creation-input").focus();
}

function loginAsSuLinkClicked() {
    messageContainer.html("");
    var data = {
        action: 'loginAsSu'
    };
    $.ajax({
        url: CONFIG.idProviderUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: handleSuLoginResponse,
        error: handleSuLoginError,
        data: JSON.stringify(data)
    });
}

$(function () {
    loginForm = $("#login-form");

    if (loginForm.length) {
        return;
    }

    welcomeText = $("#welcome-text");
    enonicLogo = $("#enonic-logo");
    createAdminViewButton = $("#create-admin-view-button");
    loginAsSuLink = $(".login-su-link");
    messageContainer = $("#message-container");
    welcomeView = $("#welcome-view");
    creationView = $("#creation-view");

    loginAsSuLink.click(function () {
        loginAsSuLinkClicked();
        return false;
    });
    createAdminViewButton.click(function () {
        displayCreationView();
        return false;
    });

    welcomeText.html(i18n.localise('page.welcome.text'));
    createAdminViewButton.html(i18n.localise('page.welcome.button'));
    loginAsSuLink.html(i18n.localise('page.welcome.login'));
});

