var $ = require('jquery');
var i18n = require ('./i18n');

var loginButton = $("#login-button");
var userNameInput = $("#username-input");
var passwordInput = $("#password-input");

function handleAuthenticateResponse(loginResult) {
    if (loginResult.authenticated) {
        if (CONFIG.redirectUrl) {
            location.href = CONFIG.redirectUrl;
        } else {
            location.reload();
        }
    } else {
        $("#message-container").html(i18n.localise('notify.login.failed'));
        passwordInput.focus();
        $("#username-input, #password-input, #login-button").addClass("invalid");
    }
}

function loginButtonClick() {
    if (checkFieldsEmpty()) {
        return;
    }

    $("#username-input, #password-input, #login-button").removeClass("invalid");

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
    return userNameInput.val().trim() === "" || passwordInput.val().trim() === "";
}

function onInputTyped(event) {
    $("#username-input, #password-input, #login-button").removeClass("invalid");

    var fieldsEmpty = checkFieldsEmpty();
    if (fieldsEmpty) {
        loginButton.hide();
        $("#message-container").html("");
    } else {
        loginButton.show();
        if (event.which !== 13) {
            $("#message-container").html("");
        }
    }
}

loginButton.click(function () {
    loginButtonClick();
    return false;
});

$("#username-input, #password-input").keyup(function (event) {
    onInputTyped(event);
});

userNameInput.click();// for mobile devices
userNameInput.focus();
var checkLoginButtonInterval = setInterval(function () { //workaround to show login button when browser autofills inputs
    var fieldsEmpty = checkFieldsEmpty();
    if (!fieldsEmpty) {
        loginButton.show();
        clearInterval(checkLoginButtonInterval);
    }
}, 100);

$("#username-input").attr('placeholder', i18n.localise('page.login.userid_or_email'));
$("#password-input").attr('placeholder', i18n.localise('page.login.password'));