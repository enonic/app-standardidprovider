'use strict' // eslint-disable-line

const $ = require('jquery');
const i18n = require('./i18n');

let loginButton;
let userNameInput;
let passwordInput;
let messageContainer;
let loginForm;

function clearErrors() {
    messageContainer.html('');
    userNameInput.removeClass('invalid');
    passwordInput.removeClass('invalid');
}

function showGeneralError(text) {
    messageContainer.text(text);
    userNameInput.addClass('invalid');
    passwordInput.addClass('invalid');
}

function handleAuthenticateResponse(loginResult) {
    if (loginResult && loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            window.location.href = CONFIG.redirectUrl;
        } else {
            window.location.reload();
        }
        return;
    }

    showGeneralError(i18n.localise('notify.login.failed'));
    passwordInput.val('').focus();
    updateLoginButtonState();
}

function handleAuthenticateError() {
    showGeneralError(i18n.localise('notify.login.failed'));
    passwordInput.focus();
    updateLoginButtonState();
}

function checkFieldsEmpty() {
    return (
        userNameInput.val().trim() === '' || passwordInput.val().trim() === ''
    );
}

function updateLoginButtonState() {
    loginButton.prop('disabled', checkFieldsEmpty());
}

function submitLogin() {
    if (checkFieldsEmpty() || loginButton.prop('disabled')) {
        return;
    }
    clearErrors();
    loginButton.prop('disabled', true);

    const data = {
        action: 'login',
        user: userNameInput.val(),
        password: passwordInput.val()
    };
    $.ajax({
        url: CONFIG.idProviderUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: handleAuthenticateResponse,
        error: handleAuthenticateError,
        data: JSON.stringify(data)
    });
}

function onInput() {
    if (userNameInput.hasClass('invalid') || passwordInput.hasClass('invalid')) {
        clearErrors();
    }
    updateLoginButtonState();
}

$(() => {
    loginForm = $('#login-form');
    if (!loginForm.length) {
        return;
    }

    loginButton = $('#login-button');
    userNameInput = $('#username-input');
    passwordInput = $('#password-input');
    messageContainer = $('#message-container');

    loginForm.on('submit', (e) => {
        e.preventDefault();
        submitLogin();
    });

    userNameInput.on('input', onInput);
    passwordInput.on('input', onInput);

    $('#username-label').text(i18n.localise('page.creation.username'));
    $('#password-label').text(i18n.localise('page.creation.password'));
    userNameInput.attr('placeholder', i18n.localise('page.login.userid_or_email'));
    passwordInput.attr('placeholder', i18n.localise('page.login.password'));

    updateLoginButtonState();

    setTimeout(() => {
        userNameInput.trigger('focus');
    }, 0);

    // Workaround to refresh button state when browser autofills inputs
    const autofillInterval = setInterval(() => {
        if (!checkFieldsEmpty()) {
            updateLoginButtonState();
            clearInterval(autofillInterval);
        }
    }, 100);
    setTimeout(() => clearInterval(autofillInterval), 5000);
});
