const ROOT_URL = "https://extavalon.com";

const ROOT_ID = "root";
const ERRORS_ID = "errors";
const MAIN_ID = "main";
const BACK_BUTTON_ID = "back-button";
const BACK_BUTTON_TEXT = "Back";
const PROFILE_BUTTON_ID = "profile-button";
const PROFILE_BUTTON_TEXT = "Profile"
const STATS_BUTTON_ID = "stats-button";
const STATS_BUTTON_TEXT = "Stats"
const SIGNOUT_BUTTON_ID = "signout-button";
const SIGNOUT_BUTTON_TEXT = "Sign Out";

const NEW_GAME_BUTTON_ID = "new-game-button";
const NEW_GAME_BUTTON_TEXT = "New Game";
const JOIN_GAME_BUTTON_ID = "join-game-button";
const JOIN_GAME_BUTTON_TEXT = "Join Game";
const CREATE_GAME_BUTTON_TEXT = "Create Game";
const GAME_CODE_INPUT_NAME = "code";
const GAME_CODE_INPUT_PLACEHOLDER = "Enter Game Code";

function createTextInput(id, name, placeholder, maxLength) {
    const textInput = document.createElement("input");
    if (id) {
        textInput.id = id;
    }
    if (name) {
        textInput.name = name;
    }
    textInput.type = "text";
    textInput.required = true;
    textInput.placeholder = placeholder;
    textInput.maxLength = maxLength;
    textInput.classList.add("future-input");
    return textInput;
}

function createSubmitInput(text) {
    const submitInput = document.createElement("input");
    submitInput.type = "submit";
    submitInput.value = text;
    submitInput.classList.add("future-button");
    return submitInput;
}

function createHiddenInput(name, value) {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = name;
    hiddenInput.value = value;
    return hiddenInput;
}

function createButton(id, text, disabled) {
    const button = document.createElement('button');
    button.id = id;
    button.innerText = text;
    button.disabled = disabled;
    button.classList.add("future-button");
    if (disabled) {
        button.classList.add("future-button-disabled");
    }
    return button;
}

function createForm(method) {
    const form = document.createElement("form");
    form.method = method;
    form.action = "/game";
    form.autocomplete = "off";
    form.addEventListener('submit', (event) => {
        form.submit();
    });
    return form;
}

function createDiv(styleClasses) {
    const divElement = document.createElement("div");
    for (let styleClass of styleClasses) {
        divElement.classList.add(styleClass);
    }
    return divElement;
}

function createGameSettingItem(text, name, checked=true) {
    const settingItem = createDiv(["center-flex-row"]);

    const settingHeader = document.createElement("label");
    settingHeader.innerText = text;
    settingHeader.classList.add("future-label");

    const settingSwitch = document.createElement("label");
    settingSwitch.classList.add("switch");

    const settingInputCheckbox = document.createElement("input");
    settingInputCheckbox.type = "checkbox";
    settingInputCheckbox.name = name;
    settingInputCheckbox.checked = checked;

    const settingSpanSlider = document.createElement("span");
    settingSpanSlider.classList.add("slider");

    settingSwitch.appendChild(settingInputCheckbox);
    settingSwitch.appendChild(settingSpanSlider);
    settingItem.appendChild(settingHeader);
    settingItem.appendChild(settingSwitch);

    return settingItem;
}

function parseCookie(str) {
    return str.split(';').map(v => v.split('=')).reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById(ROOT_ID);
    const main = document.getElementById(MAIN_ID);

    let {menu} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    let lastGameCode = null;
    const parsedCookie = parseCookie(document.cookie);
    if (parsedCookie.lastGameCode) {
        lastGameCode = parsedCookie.lastGameCode;
    }

    function clearMain(clearErrors) {
        if (clearErrors) {
            var rootChildren = root.children;
            for (var i = 0; i < rootChildren.length; i++) {
                var rootChild = rootChildren[i];
                if (rootChild.id === ERRORS_ID) {
                    root.removeChild(rootChild);
                    break;
                }
            }
        }

        while (main.children.length > 0) {
            main.removeChild(main.lastChild);
        }
    }

    function showMainMenu(clearErrors=true) {
        clearMain(clearErrors);

        const profileButton = createButton(PROFILE_BUTTON_ID, PROFILE_BUTTON_TEXT, false);
        const statsButton = createButton(STATS_BUTTON_ID, STATS_BUTTON_TEXT, false);
        const newGameButton = createButton(NEW_GAME_BUTTON_ID, NEW_GAME_BUTTON_TEXT, false);
        const joinGameButton = createButton(JOIN_GAME_BUTTON_ID, JOIN_GAME_BUTTON_TEXT, false);
        const signoutButton = createButton(SIGNOUT_BUTTON_ID, SIGNOUT_BUTTON_TEXT, false);

        profileButton.onclick = function () {
            location.assign(`${ROOT_URL}/profile`);
        };
        statsButton.onclick = function () {
            location.assign(`${ROOT_URL}/stats`);
        };
        newGameButton.onclick = function () {
            handleNewGameButtonClick();
        };
        joinGameButton.onclick = handleJoinGameButtonClick;
        signoutButton.onclick = function () {
            location.assign(`${ROOT_URL}/login`);
        };

        main.appendChild(profileButton);
        main.appendChild(statsButton);
        main.appendChild(newGameButton);
        main.appendChild(joinGameButton);
        main.appendChild(signoutButton);
    }

    function handleNewGameButtonClick(clearErrors=true) {
        clearMain(clearErrors);

        const newGameForm = createForm("post")
        const settingContainer = createDiv(["center-flex-column"]);
        const bedivereSetting = createGameSettingItem("Bedivere:", "bedivere", false);
        const titaniaSetting = createGameSettingItem("Titania:", "titania", false);
        const accolonSetting = createGameSettingItem("Accolon:", "accolon");
        const mordredSetting = createGameSettingItem("Force Mordred:", "mordred", false);
        const createGameButton = createSubmitInput(CREATE_GAME_BUTTON_TEXT);
        const backButton = createButton(BACK_BUTTON_ID, BACK_BUTTON_TEXT, false);

        backButton.onclick = showMainMenu;

        settingContainer.appendChild(bedivereSetting);
        settingContainer.appendChild(titaniaSetting);
        settingContainer.appendChild(accolonSetting);
        settingContainer.appendChild(mordredSetting);
        newGameForm.appendChild(settingContainer);
        newGameForm.appendChild(createGameButton);
        main.appendChild(newGameForm);
        main.appendChild(backButton);
    }

    function handleJoinGameButtonClick(clearErrors=true) {
        clearMain(clearErrors);

        const joinForm = createForm("get");
        const gameCodeInput = createTextInput(null, GAME_CODE_INPUT_NAME, GAME_CODE_INPUT_PLACEHOLDER, 4);
        const joinButton = createSubmitInput(JOIN_GAME_BUTTON_TEXT);
        const backButton = createButton(BACK_BUTTON_ID, BACK_BUTTON_TEXT, false);

        if (parsedCookie.lastGameCode) {
            gameCodeInput.value = parsedCookie.lastGameCode;
        }
        gameCodeInput.oninput = function () {
            let p=this.selectionStart;
            this.value=this.value.toUpperCase();
            this.setSelectionRange(p, p);
        };
        backButton.onclick = showMainMenu;

        joinForm.appendChild(gameCodeInput);
        joinForm.appendChild(joinButton);
        main.appendChild(joinForm);
        main.appendChild(backButton);
    }

    switch (menu) {
        case 'new':
            handleNewGameButtonClick(false);
            break;
        case 'join':
            handleJoinGameButtonClick(false);
            break;
        default:
            showMainMenu(false);
            break;
    }
});