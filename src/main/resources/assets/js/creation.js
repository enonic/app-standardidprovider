var $ = require('jquery');
var i18n = require('./i18n');

var emailRegexp = /^[^@]+@+[^@]+$/;
var illegalUsernameCharactersRegexp = /[<>"'/\\*?|]/;
var reservedUsernamesRegexp = /^(su|anonymous)$/;

var validClass = 'valid';
var invalidClass = 'invalid';
var disabledClass = 'disabled';
var checkTimeout = 500;

var fillUsername = true;

var creationText, emailCreationLabel, emailCreationInput, usernameCreationLabel,
    usernameCreationInput, passwordCreationLabel, passwordCreationInput, passwordRepeatLabel,
    passwordRepeatInput, createAdminButton, messageContainer, loginForm, inputs, passwordInvalidText;

function checkEmail() {
    setValidity(emailCreationInput, emailRegexp.test(emailCreationInput.val()));
    checkForm();
}

function checkUsername() {
    setValidity(usernameCreationInput, !reservedUsernamesRegexp.test(usernameCreationInput.val()) &&
                                       !illegalUsernameCharactersRegexp.test(usernameCreationInput.val()));
    checkForm();
}

function checkPasswords() {
    setValidity(passwordCreationInput, passwordCreationInput.val().length >= 10);

    passwordInvalidText.toggle(passwordCreationInput.hasClass(invalidClass));

    setValidity(passwordRepeatInput, passwordRepeatInput.val() === passwordCreationInput.val());
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
            location.href = CONFIG.redirectUrl;
        } else {
            location.reload();
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

    loginForm = $("#login-form");
    if (loginForm.length) {
        return;
    }

    creationText = $("#creation-text");
    emailCreationLabel = $("#email-creation-label");
    emailCreationInput = $("#email-creation-input");
    usernameCreationLabel = $("#username-creation-label");
    usernameCreationInput = $("#username-creation-input");
    passwordCreationLabel = $("#password-creation-label");
    passwordCreationInput = $("#password-creation-input");
    passwordRepeatLabel = $("#password-repeat-label");
    passwordRepeatInput = $("#password-repeat-input");
    passwordInvalidText = $("#invalid-password-message");
    createAdminButton = $("#create-admin-button");
    messageContainer = $("#message-container");
    inputs = [emailCreationInput, usernameCreationInput, passwordCreationInput, passwordRepeatInput];

    passwordInvalidText.hide();

    var emailCreationTimeoutId;
    emailCreationInput.keyup(function () {
        if (fillUsername) {
            var emailValue = emailCreationInput.val();
            if (emailValue) {
                var atIndex = emailValue.indexOf('@');
                usernameCreationInput.val(atIndex === -1 ? emailValue : emailValue.substr(0, atIndex));
            }
        }
        clearTimeout(emailCreationTimeoutId);
        emailCreationTimeoutId = setTimeout(function() {
            checkEmail();
            if (fillUsername) {
                checkUsername();
            }
        }, checkTimeout);
    });

    var usernameCreationTimeoutId;
    usernameCreationInput.keyup(function () {
        fillUsername=false;
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
            messageContainer.html("");
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
    emailCreationInput.attr('placeholder', i18n.localise('page.creation.email'));
    usernameCreationLabel.html(i18n.localise('page.creation.username'));
    usernameCreationInput.attr('placeholder', i18n.localise('page.creation.username'));
    passwordCreationLabel.html(i18n.localise('page.creation.password'));
    passwordCreationInput.attr('placeholder', i18n.localise('page.creation.password.placeholder'));
    passwordRepeatLabel.html(i18n.localise('page.creation.password_repeat'));
    passwordRepeatInput.attr('placeholder', i18n.localise('page.creation.password_repeat'));
    createAdminButton.html(i18n.localise('page.creation.button'));
    passwordInvalidText.html(i18n.localise('page.creation.password.short'));
});



 