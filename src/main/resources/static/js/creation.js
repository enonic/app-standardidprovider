'use strict' // eslint-disable-line

const $ = require('jquery');
const {passwordStrength} = require('check-password-strength');
const i18n = require('./i18n');

const emailRegexp = /^[^@\s]+@+[^@\s]+$/;
const nodeIdRegexp = /^[\w-.:]+$/;
const reservedUsernamesRegexp = /^(su|anonymous)$/;
const strengthLevels = ['bad', 'weak', 'medium', 'strong'];

const validClass = 'valid';
const invalidClass = 'invalid';
const checkTimeout = 500;

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
let inputs;
let passwordInvalidText;
let confirmPasswordInvalidText;
let emailInvalidText;
let creationView;
let passwordStrengthBadge;
let currentPasswordStrength = '';

function setValidity(input, valid) {
    if (input.val() === '') {
        input.removeClass([validClass, invalidClass]);
    } else if (valid) {
        input.removeClass(invalidClass).addClass(validClass);
    } else {
        input.removeClass(validClass).addClass(invalidClass);
    }
}

function toggleError(errorEl, show) {
    errorEl.toggleClass('hidden', !show);
}

function checkEmail() {
    setValidity(emailCreationInput, emailRegexp.test(emailCreationInput.val()));
    toggleError(emailInvalidText, emailCreationInput.hasClass(invalidClass));
    checkForm();
}

function checkUsername() {
    setValidity(
        usernameCreationInput,
        !reservedUsernamesRegexp.test(usernameCreationInput.val()) &&
            nodeIdRegexp.test(usernameCreationInput.val())
    );
    toggleError(userInvalidText, usernameCreationInput.hasClass(invalidClass));
    checkForm();
}

function updatePasswordStrength() {
    const value = passwordCreationInput.val() || '';

    strengthLevels.forEach((level) => passwordStrengthBadge.removeClass('strength-' + level));

    if (value.length === 0) {
        currentPasswordStrength = '';
        passwordStrengthBadge.text('');
        return;
    }

    const result = passwordStrength(value).value || '';
    const normalized = result.toLowerCase().replace(/\s+/g, '');
    let level = 'bad';
    if (normalized === 'strong') {
        level = 'strong';
    } else if (normalized === 'medium') {
        level = 'medium';
    } else if (normalized === 'weak') {
        level = 'weak';
    }

    currentPasswordStrength = level;
    passwordStrengthBadge.addClass('strength-' + level);
    passwordStrengthBadge.text(i18n.localise('field.pswGenerator.complexity.' + level));
}

function checkPasswords() {
    updatePasswordStrength();
    setValidity(
        passwordCreationInput,
        passwordCreationInput.val().length > 0 && currentPasswordStrength === 'strong'
    );

    setValidity(
        passwordRepeatInput,
        passwordRepeatInput.val() !== '' &&
            passwordRepeatInput.val() === passwordCreationInput.val()
    );
    toggleError(
        confirmPasswordInvalidText,
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
    createAdminButton.prop('disabled', !enabled);
}

function handleCreateAdminUserResponse(result) {
    if (result && result.authenticated) {
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
    messageContainer.text(i18n.localise('notify.creation.failed'));
}

function submitCreate() {
    if (createAdminButton.prop('disabled')) {
        return;
    }
    messageContainer.html('');
    createAdminButton.prop('disabled', true);
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

$(() => {
    if ($('#login-form').length) {
        return;
    }

    creationView = $('#creation-view');
    if (!creationView.length) {
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
    passwordStrengthBadge = $('#password-strength-badge');
    createAdminButton = $('#create-admin-button');
    messageContainer = $('#message-container');
    inputs = [
        emailCreationInput,
        usernameCreationInput,
        passwordCreationInput,
        passwordRepeatInput
    ];

    emailInvalidText.addClass('hidden');
    confirmPasswordInvalidText.addClass('hidden');
    userInvalidText.addClass('hidden');

    creationView.find('input').on('input', () => {
        messageContainer.html('');
    });

    let emailCreationTimeoutId;
    emailCreationInput.on('input', () => {
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

    emailCreationInput.on('blur', () => {
        clearTimeout(emailCreationTimeoutId);
        checkEmail();
        if (fillUsername) {
            checkUsername();
        }
    });

    let usernameCreationTimeoutId;
    usernameCreationInput.on('input', () => {
        fillUsername = false;
        clearTimeout(usernameCreationTimeoutId);
        usernameCreationTimeoutId = setTimeout(checkUsername, checkTimeout);
    });

    passwordCreationInput.on('input', checkPasswords);
    passwordRepeatInput.on('input', checkPasswords);

    creationView.on('submit', (e) => {
        e.preventDefault();
        submitCreate();
    });

    const passwordToggle = $('#password-toggle');
    passwordToggle.on('click', (e) => {
        e.preventDefault();
        const visible = passwordCreationInput.attr('type') === 'text';
        passwordCreationInput.attr('type', visible ? 'password' : 'text');
        passwordToggle.toggleClass('is-visible', !visible);
        passwordToggle.attr('aria-pressed', String(!visible));
    });

    creationText.text(i18n.localise('page.creation.text'));
    emailCreationLabel.text(i18n.localise('page.creation.email'));
    emailCreationInput.attr('placeholder', i18n.localise('page.creation.email'));
    emailInvalidText.text(i18n.localise('page.creation.error.email'));

    usernameCreationLabel.text(i18n.localise('page.creation.username'));
    usernameCreationInput.attr('placeholder', i18n.localise('page.creation.username'));
    userInvalidText.text(i18n.localise('page.creation.error.userName'));

    passwordCreationLabel.text(i18n.localise('page.creation.password'));
    passwordCreationInput.attr('placeholder', i18n.localise('page.creation.password'));
    passwordInvalidText.text(i18n.localise('field.pswGenerator.helpText'));

    passwordRepeatLabel.text(i18n.localise('page.creation.confirmPassword'));
    passwordRepeatInput.attr('placeholder', i18n.localise('page.creation.confirmPassword'));
    confirmPasswordInvalidText.text(i18n.localise('page.creation.error.confirmPassword'));

    createAdminButton.text(i18n.localise('page.creation.createAdmin'));
    $('#login-as-guest-link').text(i18n.localise('page.creation.loginAsGuest'));

    createAdminButton.prop('disabled', true);
});
