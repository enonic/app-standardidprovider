'use strict' // eslint-disable-line

var $ = require('jquery');
var i18n = require('./i18n');

var welcomeText;
var enonicLogo;
var createAdminLink;
var loginAsGuestButton;
var messageContainer;
var welcomeView;
var creationView;
var loginForm;

function handleSuLoginResponse(loginResult) {
    if (loginResult && loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            window.location.href = CONFIG.redirectUrl;
        } else {
            window.location.reload();
        }
    } else {
        handleSuLoginError();
    }
}

function handleSuLoginError() {
    messageContainer.html(i18n.localise('notify.login.failed'));
}

function displayCreationView() {
    messageContainer.html('');
    // TODO Refactor to use state and history
    enonicLogo.attr('hidden', '');
    welcomeView.attr('hidden', '');
    creationView.attr('hidden', null);
    $('#email-creation-input').focus();
}

function loginAsSuLinkClicked() {
    messageContainer.html('');
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
    loginForm = $('#login-form');

    if (loginForm.length) {
        return;
    }

    welcomeText = $('#welcome-text');
    enonicLogo = $('#enonic-logo');
    createAdminLink = $('.create-admin-link');
    loginAsGuestButton = $('.login-as-guest');
    messageContainer = $('#message-container');
    welcomeView = $('#welcome-view');
    creationView = $('#creation-view');

    loginAsGuestButton.click(function () {
        loginAsSuLinkClicked();
        return false;
    });
    createAdminLink.click(function () {
        displayCreationView();
        return false;
    });

    welcomeText.html(i18n.localise('page.welcome.text'));
    $('#login-as-guest-button').html(
        i18n.localise('page.welcome.loginAsGuest')
    );
    createAdminLink.html(i18n.localise('page.welcome.createAdmin'));
});
