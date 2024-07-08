'use strict' // eslint-disable-line

const $ = require('jquery');
const i18n = require('./i18n');

const emailRegexp = /^[^@\s]+@+[^@\s]+$/;
const nodeIdRegexp = /^[\w-.:]+$/;
const reservedUsernamesRegexp = /^(su|anonymous)$/;

const validClass = 'valid';
const invalidClass = 'invalid';
const disabledClass = 'disabled';
const checkTimeout = 1000;

let fillUsername = true;

let creationText;
let userInvalidText;
let emailCreationLabel;
let emailCreationInput;
let usernameCreationLabel;
let usernameCreationInput;
let passwordCreationLabel;
let passwordCreationInput;
let passwordRepeatLabel;
let passwordRepeatInput;
let createAdminButton;
let messageContainer;
let loginForm;
let inputs;
let passwordInvalidText;
let confirmPasswordInvalidText;
let emailInvalidText;

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
    let enabled = true;
    inputs.forEach((input) => {
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

$(() => {
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

    let emailCreationTimeoutId;
    emailCreationInput.keyup(() => {
        if (fillUsername) {
            const emailValue = emailCreationInput.val() || '';
            const atIndex = emailValue.indexOf('@');
            usernameCreationInput.val(
                atIndex === -1 ? emailValue : emailValue.substr(0, atIndex)
            );
        }

        clearTimeout(emailCreationTimeoutId);
        emailCreationTimeoutId = setTimeout(() => {
            checkEmail();
            if (fillUsername) {
                checkUsername();
            }
        }, checkTimeout);
    });

    let usernameCreationTimeoutId;
    usernameCreationInput.keyup(() => {
        fillUsername = false;
        clearTimeout(usernameCreationTimeoutId);
        usernameCreationTimeoutId = setTimeout(checkUsername, checkTimeout);
    });

    let passwordCreationTimeoutId;
    passwordCreationInput.keyup(() => {
        clearTimeout(passwordCreationTimeoutId);
        passwordCreationTimeoutId = setTimeout(checkPasswords, checkTimeout);
    });

    let passwordRepeatitionTimeoutId;
    passwordRepeatInput.keyup(() => {
        clearTimeout(passwordRepeatitionTimeoutId);
        passwordRepeatitionTimeoutId = setTimeout(checkPasswords, checkTimeout);
    });

    createAdminButton.click(() => {
        if (!createAdminButton.hasClass(disabledClass)) {
            messageContainer.html('');
            createAdminButton.addClass(disabledClass);
            const data = {
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
