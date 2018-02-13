var $ = require('jquery');

var emailRegexp = /^[^@]+@+[^@]+$/;
var usernameRegexp = /[<>"'/\\*?|]/;

var validClass = 'valid';
var invalidClass = 'invalid';

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
    setValidity(usernameCreationInput, !usernameRegexp.test(usernameCreationInput.val()));
    checkForm();
}

function checkPasswords() {
    setValidity(passwordCreationInput, passwordCreationInput.val().length >= 10);
    setValidity(passwordRepeatInput, passwordRepeatInput.val() === passwordCreationInput.val());
    checkForm();
}

function checkForm() {
    var valid = true;
    inputs.forEach(function (input) {
        if (!input.hasClass(validClass)) {
            valid = false;
        }
    });
    if (valid) {
        createAdminButton.removeClass(invalidClass);
        createAdminButton.addClass(validClass);
    } else {
        createAdminButton.removeClass(validClass);
        createAdminButton.addClass(invalidClass);
    }
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