const FIRST_NAME_INPUT_ID = "first-name-input";
const LAST_NAME_INPUT_ID = "last-name-input";
const LOGIN_BUTTON_ID = "login-button";
const LOGIN_FORM_ID = "login-form"

const firstNameInput = document.getElementById(FIRST_NAME_INPUT_ID);
const lastNameInput = document.getElementById(LAST_NAME_INPUT_ID);
const loginButton = document.getElementById(LOGIN_BUTTON_ID);
const loginForm = document.getElementById(LOGIN_FORM_ID);

function handleNameCheck() {
    const firstNameCheck = checkRequiredTextInput(firstNameInput, 2, 16, loginButton);
    const lastNameCheck = checkRequiredTextInput(lastNameInput, 2, 16, loginButton);
    if (firstNameCheck && lastNameCheck) {
        if (loginButton.classList.contains("future-button-disabled")) {
            loginButton.classList.remove("future-button-disabled");
        }
        loginButton.disabled = false;
    } else {
        if (!loginButton.classList.contains("future-button-disabled")) {
            loginButton.classList.add("future-button-disabled");
        }
        loginButton.disabled = true;
    }
}

function checkRequiredTextInput(textInput, minimumLength, maxLength) {
    const textLength = textInput.value.trim().length;
    return textLength >= minimumLength && textLength <= maxLength;
}

firstNameInput.oninput = handleNameCheck;
lastNameInput.oninput = handleNameCheck;

function titleCase(str) {
    if ((str === null) || (str === '')) {
        return false;
    } else {
        str = str.toString();
        str = str.trim();
    }

    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

loginForm.onsubmit = function () {
    const firstNameValue = titleCase(firstNameInput.value);
    localStorage.setItem("firstName", firstNameValue);
    firstNameInput.value = firstNameValue;
    const lastNameValue = titleCase(lastNameInput.value);
    localStorage.setItem("lastName", lastNameValue);
    lastNameInput.value = lastNameValue;
    return true;
}

const firstNamePlaceholder = localStorage.getItem("firstName");
const lastNamePlaceholder = localStorage.getItem("lastName");
if (firstNamePlaceholder) {
    firstNameInput.value = firstNamePlaceholder;
}
if (lastNamePlaceholder) {
    lastNameInput.value = lastNamePlaceholder;
}
handleNameCheck();
