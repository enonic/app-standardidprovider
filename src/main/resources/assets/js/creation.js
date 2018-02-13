var $ = require('jquery');

var emailRegexp = /^[^@]+@+[^@]+$/;
var usernameRegexp = /[<>"'/\\*?|]/;
var emailCreationInput = $("#email-creation-input");
var usernameCreationInput = $("#username-creation-input");
var passwordCreationInput = $("#password-creation-input");
var passwordRepeatInput = $("#password-repeat-input");
var checkTimeout = 500;

function checkEmail() {
    setValidity(emailCreationInput, emailRegexp.test(emailCreationInput.val()));
}

function checkUsername() {
    setValidity(usernameCreationInput, !usernameRegexp.test(usernameCreationInput.val()));
}

function checkPassword() {
    setValidity(passwordCreationInput, passwordCreationInput.val().length >= 10);
}

function checkPasswordRepetition() {
    setValidity(passwordRepeatInput, passwordRepeatInput.val() === passwordCreationInput.val());
}

function setValidity(input, valid) {
    if (input.val() === '') {
        input.removeClass(['valid', 'invalid']);
    } else if (valid) {
        input.removeClass('invalid');
        input.addClass('valid');
    } else {
        input.removeClass('valid');
        input.addClass('invalid');
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
    passwordCreationTimeoutId = setTimeout(checkPassword, checkTimeout);
});

var passwordRepeatitionTimeoutId;
passwordRepeatInput.keyup(function () {
    clearTimeout(passwordRepeatitionTimeoutId);
    passwordRepeatitionTimeoutId = setTimeout(checkPasswordRepetition, checkTimeout);
});