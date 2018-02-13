var $ = require('jquery');

var emailRegexp = /^[^@]+@+[^@]+$/;
var illegalUsernameCharactersRegexp = /[<>"'/\\*?|]/;
var reservedUsernamesRegexp = /^(su|anonymous)$/;
var usernameRegexp = /[<>"'/\\*?|]/;

var validClass = 'valid';
var invalidClass = 'invalid';
var disabledClass = 'disabled';

var emailCreationInput = $("#email-creation-input");
var usernameCreationInput = $("#username-creation-input");
var passwordCreationInput = $("#password-creation-input");
var passwordRepeatInput = $("#password-repeat-input");
var createAdminButton = $("#create-admin-button");
var inputs = [emailCreationInput, usernameCreationInput, passwordCreationInput, passwordRepeatInput];
var checkTimeout = 500;

function checkEmail() {
    setValidity(emailCreationInput, emailRegexp.test(emailCreationInput.val()));
    checkForm();
}

function checkUsername() {
    setValidity(usernameCreationInput, !reservedUsernamesRegexp.test(usernameCreationInput.val()) && !illegalUsernameCharactersRegexp.test(usernameCreationInput.val()));
    checkForm();
}

function checkPasswords() {
    setValidity(passwordCreationInput, passwordCreationInput.val().length >= 10);
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
    if (enabled) {
        button.removeClass(disabledClass);
    } else {
        button.addClass(disabledClass);
    }
}

function handleCreateAdminUserResponse(creationResult) {
    if (creationResult && creationResult.authenticated) {
        if (CONFIG.redirectUrl) {
            location.href = CONFIG.redirectUrl;
        } else {
            location.reload();
        }
    }
    //TODO
}

var emailCreationTimeoutId;
emailCreationInput.keyup(function () {
    clearTimeout(emailCreationTimeoutId);
    emailCreationTimeoutId = setTimeout(checkEmail, checkTimeout);
});

var usernameCreationTimeoutId;
usernameCreationInput.keyup(function () {
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
        createAdminButton.hasClass(disabledClass);
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
            data: JSON.stringify(data)
        });
    }
});