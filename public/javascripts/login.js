const FIRST_NAME_INPUT_ID = "first-name-input";
const LAST_NAME_INPUT_ID = "last-name-input";
const LOGIN_BUTTON_ID = "login-button";

document.addEventListener('DOMContentLoaded', function () {
    const firstNameInput = document.getElementById(FIRST_NAME_INPUT_ID);
    const lastNameInput = document.getElementById(LAST_NAME_INPUT_ID);
    const loginButton = document.getElementById(LOGIN_BUTTON_ID);

    firstNameInput.oninput = handleNameCheck;
    lastNameInput.oninput = handleNameCheck;

    function handleNameCheck() {
        const firstNameCheck = checkRequiredTextInput(firstNameInput, 2, 16, loginButton);
        const lastNameCheck = checkRequiredTextInput(lastNameInput, 2, 16, loginButton);
        if (firstNameCheck && lastNameCheck) {
            if (loginButton.classList.contains("future-disabled")) {
                loginButton.classList.remove("future-disabled");
            }
            loginButton.disabled = false;
        } else {
            if (!loginButton.classList.contains("future-disabled")) {
                loginButton.classList.add("future-disabled");
            }
            loginButton.disabled = true;
        }
    }

    function checkRequiredTextInput(textInput, minimumLength, maxLength) {
        const textLength = textInput.value.trim().length;
        return textLength >= minimumLength && textLength <= maxLength;
    }
});