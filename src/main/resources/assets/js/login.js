'use strict' // eslint-disable-line

var $ = require('jquery');
var i18n = require('./i18n');

var loginButton;
var userNameInput;
var passwordInput;
var messageContainer;
var loginForm;

function handleAuthenticateResponse(loginResult) {
    if (loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            window.location.href = CONFIG.redirectUrl;
        } else {
            window.location.reload();
        }
    } else {
        messageContainer.html(i18n.localise('notify.login.failed'));
        passwordInput.focus();
        $('#username-input, #password-input, #login-button').addClass(
            'invalid'
        );
    }
}

function loginButtonClicked() {
    if (checkFieldsEmpty()) {
        return;
    }

    $('#username-input, #password-input, #login-button').removeClass('invalid');

    var data = {
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
        data: JSON.stringify(data)
    });
}

function checkFieldsEmpty() {
    return (
        userNameInput.val().trim() === '' || passwordInput.val().trim() === ''
    );
}

function onInputTyped(event) {
    $('#username-input, #password-input, #login-button').removeClass('invalid');

    var fieldsEmpty = checkFieldsEmpty();
    if (fieldsEmpty) {
        loginButton.hide();
        messageContainer.html('');
    } else {
        loginButton.show();
        if (event.which !== 13) {
            messageContainer.html('');
        }
    }
}

$(function() {
    loginForm = $('#login-form');

    if (!loginForm.length) {
        return;
    }

    loginButton = $('#login-button');
    userNameInput = $('#username-input');
    passwordInput = $('#password-input');
    messageContainer = $('#message-container');

    loginButton.click(function() {
        loginButtonClicked();
        return false;
    });
    $('#username-input, #password-input').keyup(onInputTyped);

    userNameInput.click(); // for mobile devices
    userNameInput.focus();
    var checkLoginButtonInterval = setInterval(function() {
        // workaround to show login button when browser autofills inputs
        var fieldsEmpty = checkFieldsEmpty();
        if (!fieldsEmpty) {
            loginButton.show();
            clearInterval(checkLoginButtonInterval);
        }
    }, 100);

    $('#username-input').attr(
        'placeholder',
        i18n.localise('page.login.userid_or_email')
    );
    $('#password-input').attr(
        'placeholder',
        i18n.localise('page.login.password')
    );
});
