'use strict' // eslint-disable-line

const $ = require('jquery');
const i18n = require('./i18n');

let welcomeView;
let creationView;
let welcomeMessageContainer;
let creationMessageContainer;
let createAdminLink;
let loginAsGuestButton;
let loginAsGuestLink;

function activeMessageContainer() {
    if (creationView.length && !creationView[0].hasAttribute('hidden')) {
        return creationMessageContainer;
    }
    return welcomeMessageContainer;
}

function clearMessages() {
    welcomeMessageContainer.html('');
    creationMessageContainer.html('');
}

function showGeneralError(text) {
    activeMessageContainer().text(text);
}

function handleSuLoginResponse(loginResult) {
    if (loginResult && loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            window.location.href = CONFIG.redirectUrl;
        } else {
            window.location.reload();
        }
    } else {
        showGeneralError(i18n.localise('notify.login.failed'));
    }
}

function loginAsSu() {
    clearMessages();
    $.ajax({
        url: CONFIG.idProviderUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: handleSuLoginResponse,
        error: () => showGeneralError(i18n.localise('notify.login.failed')),
        data: JSON.stringify({action: 'loginAsSu'})
    });
}

function showCreationView() {
    clearMessages();
    welcomeView.attr('hidden', '');
    creationView.removeAttr('hidden');
    setTimeout(() => $('#email-creation-input').trigger('focus'), 0);
}

$(() => {
    if ($('#login-form').length) {
        return;
    }

    welcomeView = $('#welcome-view');
    creationView = $('#creation-view');
    welcomeMessageContainer = $('#welcome-message-container');
    creationMessageContainer = $('#message-container');
    createAdminLink = $('#create-admin-link');
    loginAsGuestButton = $('#login-as-guest-button');
    loginAsGuestLink = $('#login-as-guest-link');

    if (!welcomeView.length) {
        return;
    }

    loginAsGuestButton.on('click', (e) => {
        e.preventDefault();
        loginAsSu();
    });

    loginAsGuestLink.on('click', (e) => {
        e.preventDefault();
        loginAsSu();
    });

    createAdminLink.on('click', (e) => {
        e.preventDefault();
        showCreationView();
    });

    loginAsGuestButton.text(i18n.localise('page.welcome.loginAsGuest'));
    createAdminLink.text(i18n.localise('page.welcome.createAdmin'));

    setTimeout(() => loginAsGuestButton.trigger('focus'), 0);
});
