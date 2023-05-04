'use strict' // eslint-disable-line

var $ = require('jquery');
var i18n = require('./i18n');

var emailRegexp = /^[^@\s]+@+[^@\s]+$/;
var nodeIdRegexp = /^[\w-.:]+$/;
var reservedUsernamesRegexp = /^(su|anonymous)$/;

var validClass = 'valid';
var invalidClass = 'invalid';
var disabledClass = 'disabled';
var checkTimeout = 1000;

var fillUsername = true;

var creationText;
var userInvalidText;
var emailCreationLabel;
var emailCreationInput;
var usernameCreationLabel;
var usernameCreationInput;
var passwordCreationLabel;
var passwordCreationInput;
var passwordRepeatLabel;
var passwordRepeatInput;
var createAdminButton;
var messageContainer;
var loginForm;
var inputs;
var passwordInvalidText;
var confirmPasswordInvalidText;
var emailInvalidText;

function checkEmail() {
    setValidity(emailCreationInput, emailRegexp.test(emailCreationInput.val()));

    emailInvalidText.toggle(emailCreationInput.hasClass(invalidClass));

    checkForm();
}

function checkUsername() {
    setValidity(
        usernameCreationInput,
        !reservedUsernamesRegexp.test(usernameCreationInput.val()) &&
            nodeIdRegexp.test(usernameCreationInput.val())
    );

    userInvalidText.toggle(usernameCreationInput.hasClass(invalidClass));

    checkForm();
}

function checkPasswords() {
    setValidity(
        passwordCreationInput,
        passwordCreationInput.val().length >= 10
    );

    passwordInvalidText.toggle(passwordCreationInput.hasClass(invalidClass));

    setValidity(
        passwordRepeatInput,
        passwordRepeatInput.val() === passwordCreationInput.val()
    );

    confirmPasswordInvalidText.toggle(
        passwordRepeatInput.hasClass(invalidClass)
    );

    checkForm();
}

function checkForm() {
    var enabled = true;
    inputs.forEach(function (input) {
        if (!input.hasClass(validClass)) {
            enabled = false;
        }
    });
    enable(createAdminButton, enabled);
}

function setValidity(input, valid) {
    if (input.val() === '') {
        input.removeClass([validClass, invalidClass]);
    } else if (valid) {
        input.removeClass(invalidClass);
        input.addClass(validClass);
    } else {
        input.removeClass(validClass);
        input.addClass(invalidClass);
    }
}

function enable(button, enabled) {
    button.toggleClass(disabledClass, !enabled);
}

function handleCreateAdminUserResponse(creationResult) {
    if (creationResult && creationResult.authenticated) {
        if (CONFIG.redirectUrl) {
            window.location.href = CONFIG.redirectUrl;
        } else {
            window.location.reload();
        }
    } else {
        handleCreateAdminUserError();
    }
}

function handleCreateAdminUserError() {
    checkForm();
    messageContainer.html(i18n.localise('notify.creation.failed'));
}

$(function () {
    loginForm = $('#login-form');
    if (loginForm.length) {
        return;
    }

    creationText = $('#creation-text');
    emailCreationLabel = $('#email-creation-label');
    emailCreationInput = $('#email-creation-input');
    emailInvalidText = $('#invalid-email-message');
    usernameCreationLabel = $('#username-creation-label');
    usernameCreationInput = $('#username-creation-input');
    userInvalidText = $('#invalid-username-message');
    passwordCreationLabel = $('#password-creation-label');
    passwordCreationInput = $('#password-creation-input');
    passwordRepeatLabel = $('#password-repeat-label');
    passwordRepeatInput = $('#password-repeat-input');
    passwordInvalidText = $('#invalid-password-message');
    confirmPasswordInvalidText = $('#invalid-confirm-password-message');
    createAdminButton = $('#create-admin-button');
    messageContainer = $('#message-container');
    inputs = [
        emailCreationInput,
        usernameCreationInput,
        passwordCreationInput,
        passwordRepeatInput
    ];

    emailInvalidText.hide();
    passwordInvalidText.hide();
    confirmPasswordInvalidText.hide();

    var emailCreationTimeoutId;
    emailCreationInput.keyup(function () {
        if (fillUsername) {
            var emailValue = emailCreationInput.val() || '';
            var atIndex = emailValue.indexOf('@');
            usernameCreationInput.val(
                atIndex === -1 ? emailValue : emailValue.substr(0, atIndex)
            );
        }
        clearTimeout(emailCreationTimeoutId);
        emailCreationTimeoutId = setTimeout(function () {
            checkEmail();
            if (fillUsername) {
                checkUsername();
            }
        }, checkTimeout);
    });

    var usernameCreationTimeoutId;
    usernameCreationInput.keyup(function () {
        fillUsername = false;
        clearTimeout(usernameCreationTimeoutId);
        usernameCreationTimeoutId = setTimeout(checkUsername, checkTimeout);
    });

    var passwordCreationTimeoutId;
    passwordCreationInput.keyup(function () {
        clearTimeout(passwordCreationTimeoutId);
        passwordCreationTimeoutId = setTimeout(checkPasswords, checkTimeout);
    });

    var passwordRepeatitionTimeoutId;
    passwordRepeatInput.keyup(function () {
        clearTimeout(passwordRepeatitionTimeoutId);
        passwordRepeatitionTimeoutId = setTimeout(checkPasswords, checkTimeout);
    });

    createAdminButton.click(function () {
        if (!createAdminButton.hasClass(disabledClass)) {
            messageContainer.html('');
            createAdminButton.addClass(disabledClass);
            var data = {
                action: 'createAdminUser',
                user: usernameCreationInput.val(),
                email: emailCreationInput.val(),
                password: passwordCreationInput.val()
            };
            $.ajax({
                url: CONFIG.idProviderUrl,
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                success: handleCreateAdminUserResponse,
                error: handleCreateAdminUserError,
                data: JSON.stringify(data)
            });
        }
    });

    creationText.html(i18n.localise('page.creation.text'));
    emailCreationLabel.html(i18n.localise('page.creation.email'));
    emailCreationInput.attr(
        'placeholder',
        i18n.localise('page.creation.email')
    );
    emailInvalidText.html(i18n.localise('page.creation.error.email'));

    usernameCreationLabel.html(i18n.localise('page.creation.username'));
    usernameCreationInput.attr(
        'placeholder',
        i18n.localise('page.creation.username')
    );
    userInvalidText.html(i18n.localise('page.creation.error.userName'));

    passwordCreationLabel.html(i18n.localise('page.creation.password'));
    passwordCreationInput.attr(
        'placeholder',
        i18n.localise('page.creation.password.placeholder')
    );
    passwordRepeatLabel.html(i18n.localise('page.creation.confirmPassword'));
    passwordRepeatInput.attr(
        'placeholder',
        i18n.localise('page.creation.confirmPassword')
    );

    createAdminButton.html(i18n.localise('page.creation.createAdmin'));
    passwordInvalidText.html(i18n.localise('page.creation.error.password'));
    confirmPasswordInvalidText.html(
        i18n.localise('page.creation.error.confirmPassword')
    );
    $('#login-as-guest-link').html(i18n.localise('page.creation.loginAsGuest'));
});
