const ROOT_URL = "https://www.extavalon.com";
//const ROOT_URL = "http://localhost:3000";

const BACK_BUTTON_ID = "back-button";
const MENU_BUTTON_ID = "menu-button";

const MENU_MODAL_ID = "menu-modal";
const CLOSE_MENU_MODAL_BUTTON_ID = "close-menu-modal-button";
const VIEW_HELP_BUTTON_ID = "view-help-button";
const VIEW_LOBBY_BUTTON_ID = "view-lobby-button";
const VIEW_ROLE_BUTTON_ID = "view-role-button";
const VIEW_GAME_BUTTON_ID = "view-game-button";

const LOBBY_CONTENT_ID = "lobby-content";
const LOBBY_PLAYERS_ID = "lobby-players";
const LOBBY_PLAYER_COUNT_ID = "lobby-player-count";
const LOBBY_PLAYER_LIST_ID = "lobby-player-list";
const START_GAME_BUTTON_ID = "start-game-button";
const CLOSE_LOBBY_BUTTON_ID = "close-lobby-button";

const HELP_CONTENT_ID = "help-content";

const GAME_CONTENT_ID = "game-content";

const ROLE_CONTENT_ID = "role-content";

function createButton(text, styleClasses=["future-button"]) {
    const buttonElement = document.createElement('button');
    buttonElement.innerText = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            buttonElement.classList.add(styleClass);
        }
    }
    return buttonElement;
}

function createDiv(id, styleClasses) {
    const divElement = document.createElement('div');
    if (id) {
        divElement.id = id;
    }
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            divElement.classList.add(styleClass);
        }
    }
    return divElement;
}

function createParagraph(text, styleClasses) {
    const paragraphElement = document.createElement('p');
    paragraphElement.innerHTML = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            paragraphElement.classList.add(styleClass);
        }
    }
    return paragraphElement;
}

function createSection(styleClasses=[]) {
    const sectionElement = document.createElement('section');
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            sectionElement.classList.add(styleClass);
        }
    }
    return sectionElement;
}

function createHeaderTwo(id, innerHTML, styleClasses=["future-header"]) {
    const headerElement = document.createElement("h2");
    if (id) {
        headerElement.id = id;
    }
    headerElement.innerHTML = innerHTML;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            headerElement.classList.add(styleClass);
        }
    }
    return headerElement;
}

function createLabel(idFor, text) {
    const labelElement = document.createElement('label');
    labelElement.for = idFor;
    labelElement.innerText = text;
    return labelElement;
}

function createOption(value, text) {
    const optionElement = document.createElement('option');
    optionElement.value = value;
    if (text) {
        optionElement.innerText = text;
    }
    return optionElement;
}

function createSelect(id, enableNoneOption) {
    const selectElement = document.createElement('select');
    if (id) {
        selectElement.id = id;
    }
    const noneResultOption = createOption("none");
    noneResultOption.selected = true;
    if (!enableNoneOption) {
        noneResultOption.disabled = true;
    }
    selectElement.appendChild(noneResultOption);
    return selectElement;
}

function addClassToElement(element, className) {
    if (!element.classList.contains(className)) {
        element.classList.add(className);
    }
}

function removeClassFromElement(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

function hideElement(element) {
    if (element.style.display !== "none") {
        element.style.display = "none";
    }
}

function clearChildrenFromElement(element) {
    while (element.children.length > 0) {
        element.removeChild(element.lastChild);
    }
}

function setButtonDisabled(buttonElement, disabled, removeOnClick=true) {
    buttonElement.disabled = disabled;
    if (buttonElement.disabled) {
        addClassToElement(buttonElement, "future-button-disabled");
        if (removeOnClick) {
            buttonElement.removeAttribute("onclick");
        }
    } else {
        removeClassFromElement(buttonElement, "future-button-disabled");
    }
}

function createSimplePlayerListGroupItem(name, styleClasses=["list-group-item"]) {
    const playerListGroupItem = createDiv(null, styleClasses);
    const playerNameWrapper = createDiv(null, ["name-wrapper"]);
    const playerNameParagraph = createParagraph(name);
    playerNameWrapper.appendChild(playerNameParagraph);
    playerListGroupItem.appendChild(playerNameWrapper);
    return playerListGroupItem;
}

// Get elements (Probably export)
const backButton = document.getElementById(BACK_BUTTON_ID);
const menuButton = document.getElementById(MENU_BUTTON_ID);
const menuModal = document.getElementById(MENU_MODAL_ID);
const closeMenuModalButton = document.getElementById(CLOSE_MENU_MODAL_BUTTON_ID);
const viewHelpButton = document.getElementById(VIEW_HELP_BUTTON_ID);
const viewLobbyButton = document.getElementById(VIEW_LOBBY_BUTTON_ID);
const viewRoleButton = document.getElementById(VIEW_ROLE_BUTTON_ID);
const viewGameButton = document.getElementById(VIEW_GAME_BUTTON_ID);
const lobbyContent = document.getElementById(LOBBY_CONTENT_ID);
const lobbyPlayers = document.getElementById(LOBBY_PLAYERS_ID);
const startGameButton = document.getElementById(START_GAME_BUTTON_ID);
const closeLobbyButton = document.getElementById(CLOSE_LOBBY_BUTTON_ID);
const helpContent = document.getElementById(HELP_CONTENT_ID);
const gameContent = document.getElementById(GAME_CONTENT_ID);
const roleContent = document.getElementById(ROLE_CONTENT_ID);

const {code} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

/*
const parsedCookie = document.cookie.split(';').map(v => v.split('=')).reduce((acc, v) => {
    acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
    return acc;
  }, {});
const userId = parsedCookie.userId;
const firstName = parsedCookie.firstName;
const lastName = parsedCookie.lastName;
*/
const amHost = startGameButton !== null && startGameButton !== undefined;
 
//const socket = io.connect(`${ROOT_URL}?code=${code}&userId=${userId}&firstName=${firstName}&lastName=${lastName}`);
const socket = io.connect(`${ROOT_URL}?code=${code}`);

socket.on('role:setup', () => {
    handleRoleSetup();
});

socket.on('role:pick', ({possibleResistanceRoles, possibleSpyRoles}) => {
    handleRolePick(possibleResistanceRoles, possibleSpyRoles);
});

socket.on('lobby:close', () => {
    location.replace(`${ROOT_URL}?menu=join`);
});

backButton.onclick = function() {
    if (gameContent.children.length > 0) {
        hideElement(lobbyContent);
        hideElement(helpContent);
        hideElement(roleContent);
        gameContent.style.display = "flex";
        hideElement(backButton);
    } else if (roleContent.children.length > 0) {
        hideElement(lobbyContent);
        hideElement(helpContent);
        hideElement(gameContent);
        roleContent.style.display = "flex";
        hideElement(backButton);
    } else {
        hideElement(helpContent);
        hideElement(gameContent);
        hideElement(roleContent);
        lobbyContent.style.display = "flex";
        hideElement(backButton);
    }
}

menuButton.onclick = function() {
    menuModal.style.display = "block";
}
closeMenuModalButton.onclick = function() {
    hideElement(menuModal);
}
menuModal.onclick = function(event) {
    if (event.target == menuModal) {
        hideElement(menuModal);
    }
}

viewHelpButton.onclick = function() {
    hideElement(menuModal);
    hideElement(lobbyContent);
    hideElement(gameContent);
    hideElement(roleContent);
    helpContent.style.display = "flex";
    backButton.style.display = "flex";
}
viewLobbyButton.onclick = function() {
    hideElement(menuModal);
    hideElement(helpContent);
    hideElement(gameContent);
    hideElement(roleContent);
    lobbyContent.style.display = "flex";
    if (gameContent.children.length > 0 || roleContent.children.length > 0) {
        backButton.style.display = "flex";
    } else {
        hideElement(backButton);
    }
}
viewGameButton.onclick = function() {
    hideElement(menuModal);
    hideElement(lobbyContent);
    hideElement(helpContent);
    hideElement(roleContent);
    hideElement(backButton);
    gameContent.style.display = "flex";
}
viewRoleButton.onclick = function() {
    hideElement(menuModal);
    hideElement(helpContent);
    hideElement(gameContent);
    hideElement(lobbyContent);
    roleContent.style.display = "flex";
    if (gameContent.children.length > 0) {
        backButton.style.display = "flex";
    } else {
        hideElement(backButton);
    }
}

hideElement(backButton);
hideElement(viewGameButton);
hideElement(viewRoleButton);
hideElement(menuModal);
hideElement(helpContent);
hideElement(gameContent);
hideElement(roleContent);

if (amHost) {
    startGameButton.onclick = function () {
        socket.emit('game:start');
    };
    closeLobbyButton.onclick = function () {
        socket.emit('lobby:close');
    };
}

function clearGameContent(clearMissionResults=true) {
    const stopElement = clearMissionResults ? 0 : 1;
    while (gameContent.children.length > stopElement) {
        gameContent.removeChild(gameContent.lastChild);
    }
}

function createLobbyPlayerList(players) {
    if (lobbyPlayers.lastChild.id === LOBBY_PLAYER_LIST_ID) {
        lobbyPlayers.removeChild(lobbyPlayers.lastChild);
    }
    const lobbyPlayerList = createDiv(LOBBY_PLAYER_LIST_ID);
    
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const playerListElement = document.createElement('div');
        const playerNameElement = document.createElement('span');

        playerNameElement.classList.add(player.active ? 'player-active' : 'player-inactive');
        playerNameElement.innerHTML = player.name;
        playerListElement.appendChild(playerNameElement);

        if (amHost && !player.active) {
            const playerKickElement = document.createElement('span');
            playerKickElement.innerHTML = "&times;";
            playerKickElement.classList.add('remove-player-button');
            playerKickElement.onclick = function() {
                socket.emit('lobby:kick-player', i);
            }
            playerListElement.appendChild(playerKickElement);
        }

        lobbyPlayerList.appendChild(playerListElement);
    }

    return lobbyPlayerList;
}

function showRoleSetup(setupMessage) {
    hideElement(menuModal);
    hideElement(viewRoleButton);
    hideElement(lobbyContent);
    hideElement(helpContent);
    hideElement(roleContent);
    hideElement(backButton);
    clearChildrenFromElement(roleContent);

    if (viewGameButton.style.display === "none") {
        viewGameButton.style.display = "block";
        viewLobbyButton.innerText = "View Lobby";
        backButton.title = "Return To Game";
    }

    clearGameContent(true);
    gameContent.appendChild(createHeaderTwo(null, setupMessage, ["future-title"]));
    gameContent.style.display = "flex";
}

function handleRoleSetup() {
    showRoleSetup("Waiting for role information...");
}

function handleRolePick(possibleResistanceRoles, possibleSpyRoles) {
    showRoleSetup("Congratulations, you may select your role/team for this game!");

    const roleSelect = createSelect(null, false);
    roleSelect.appendChild(createOption("Resistance", "Resistance"));
    for (let possibleResistanceRole of possibleResistanceRoles) {
        roleSelect.appendChild(createOption(possibleResistanceRole, `(Resistance) ${possibleResistanceRole}`));
    }
    roleSelect.appendChild(createOption("Spy", "Spy"));
    for (let possibleSpyRole of possibleSpyRoles) {
        roleSelect.appendChild(createOption(possibleSpyRole, `(Spy) ${possibleSpyRole}`));
    }

    const submitRoleSelectionButton = createButton("Submit");
    setButtonDisabled(submitRoleSelectionButton, true);

    roleSelect.onchange = function () {
        if (roleSelect.selectedIndex !== 0) {
            setButtonDisabled(submitRoleSelectionButton, false);
            submitRoleSelectionButton.onclick = function () {
                handleSubmitRoleSelection(roleSelect.value);
            };
        } else {
            setButtonDisabled(submitRoleSelectionButton, true);
        }
    };

    gameContent.appendChild(roleSelect);
    gameContent.appendChild(submitRoleSelectionButton);
}

function handleSubmitRoleSelection(roleSelection) {
    const rolePickInformation = {
        value: roleSelection
    }
    if (roleSelection === "Resistance" || roleSelection === "Spy") {
        rolePickInformation.type = "Team";
    } else {
        rolePickInformation.type = "Role";
    }
    socket.emit('role:pick', rolePickInformation);
}

function showConductRedemption(conductRedemptionInformation) {
    gameContent.appendChild(createHeaderTwo(null, `
        Select the players you think are the <span class="spy">spies</span>:
    `));

    const players = conductRedemptionInformation.players;

    const redemptionPlayersContainer = createDiv("redemption-players-container");
    const redemptionPlayersListGroup = createDiv("redemption-players-list-group", ["list-group"]);
    let playerSelections = [];
    const requiredPlayerCount = conductRedemptionInformation.spyCount;

    const redemptionPlayersSubmitButton = createButton("Submit");
    redemptionPlayersSubmitButton.onclick = function() {
        setButtonDisabled(redemptionPlayersSubmitButton, true, false);
        const conductRedemptionInformation = {
            ids: playerSelections
        };
        socket.emit('redemption:conduct', conductRedemptionInformation);
    };

    for (let player of players) {
        const playerListGroupItem = createSimplePlayerListGroupItem(player.name, ["list-group-item", "clickable"]);

        playerListGroupItem.onclick = function() {
            const selected = playerSelections.includes(player.id);
            if (selected) {
                playerSelections.splice(playerSelections.indexOf(player.id), 1);
                removeClassFromElement(playerListGroupItem, 'selected');
            } else if (playerSelections.length !== requiredPlayerCount) {
                playerSelections.push(player.id);
                addClassToElement(playerListGroupItem, 'selected');
            }

            const submitDisabled = playerSelections.length !== requiredPlayerCount;
            setButtonDisabled(redemptionPlayersSubmitButton, submitDisabled, false);
        };
        redemptionPlayersListGroup.appendChild(playerListGroupItem);
    }
    setButtonDisabled(redemptionPlayersSubmitButton, true, false);

    redemptionPlayersContainer.appendChild(redemptionPlayersListGroup);
    gameContent.appendChild(redemptionPlayersContainer);
    gameContent.appendChild(redemptionPlayersSubmitButton);
}

function showConductAssassination(conductAssassinationInformation) {
    gameContent.appendChild(createHeaderTwo(null, `Select role and player(s) to assassinate for:`));

    const assassinationRoleContainer = createDiv("assassination-role-container", ["center-flex-row"]);
    const assassinationRoleLabel = createLabel("assassination-role-select", "Role:");
    const assassinationRoleSelect = createSelect("assassination-role-select", false);
    assassinationRoleSelect.appendChild(createOption("Merlin", "Merlin"));
    assassinationRoleSelect.appendChild(createOption("Arthur", "Arthur"));
    assassinationRoleSelect.appendChild(createOption("Lovers", "Tristan & Iseult"));
    assassinationRoleSelect.appendChild(createOption("Ector", "Ector"));
    assassinationRoleContainer.appendChild(assassinationRoleLabel);
    assassinationRoleContainer.appendChild(assassinationRoleSelect);

    const players = conductAssassinationInformation.players;

    const assassinationPlayersContainer = createDiv("assassination-players-container");
    const assassinationPlayersListGroup = createDiv("assassination-players-list-group", ["list-group"]);
    let playerSelections = [];
    let requiredPlayerCount = 1;

    const assassinationPlayersSubmitButton = createButton("Submit");
    assassinationPlayersSubmitButton.onclick = function() {
        setButtonDisabled(assassinationPlayersSubmitButton, true, false);
        const conductAssassinationInformation = {
            ids: playerSelections,
            role: assassinationRoleSelect.value
        };
        socket.emit('assassination:conduct', conductAssassinationInformation);
    };

    for (let player of players) {
        const playerListGroupItem = createSimplePlayerListGroupItem(player.name, ["list-group-item", "clickable"]);

        playerListGroupItem.onclick = function() {
            const selected = playerSelections.includes(player.id);
            if (selected) {
                playerSelections.splice(playerSelections.indexOf(player.id), 1);
                removeClassFromElement(playerListGroupItem, 'selected');
            } else if (playerSelections.length !== requiredPlayerCount) {
                playerSelections.push(player.id);
                addClassToElement(playerListGroupItem, 'selected');
            }

            const submitDisabled = playerSelections.length !== requiredPlayerCount || assassinationRoleSelect.selectedIndex === 0;
            setButtonDisabled(assassinationPlayersSubmitButton, submitDisabled, false);
        };
        assassinationPlayersListGroup.appendChild(playerListGroupItem);
    }
    setButtonDisabled(assassinationPlayersSubmitButton, true, false);

    assassinationRoleSelect.onchange = function () {
        requiredPlayerCount = assassinationRoleSelect.selectedIndex === 3 ? 2 : 1;
        const submitDisabled = playerSelections.length !== requiredPlayerCount || assassinationRoleSelect.selectedIndex === 0;
        setButtonDisabled(assassinationPlayersSubmitButton, submitDisabled, false);
    }

    gameContent.appendChild(assassinationRoleContainer);
    assassinationPlayersContainer.appendChild(assassinationPlayersListGroup);
    gameContent.appendChild(assassinationPlayersContainer);
    gameContent.appendChild(assassinationPlayersSubmitButton);
}

function showGameResult(gameResultInformation, clearMissionResults=true) {
    clearGameContent(clearMissionResults);
    gameContent.innerHTML += buildGameResultHTML(gameResultInformation);

    hideElement(menuModal);
    hideElement(lobbyContent);
    hideElement(helpContent);
    hideElement(roleContent);
    hideElement(backButton);

    if (viewGameButton.style.display === "none") {
        viewGameButton.style.display = "block";
    }
    backButton.title = "Return To Game";

    gameContent.style.display = "flex";
}

function buildGameResultHTML(gameResultInformation) {
    let resultHTML = "";
    if (gameResultInformation.winner === "Spies") {
        if (gameResultInformation.assassination) {
            resultHTML = getCorrectAssassinationResultHTML(gameResultInformation.assassination);
        } else {
            resultHTML = `<h2 class="future-header"><span class="spy">Spies</span> win!</h2>`;
        }
    } else {
        if (gameResultInformation.winner === "Resistance") {
            resultHTML = getIncorrectAssassinationResultHTML(gameResultInformation.assassination, gameResultInformation.jester, gameResultInformation.puck)
        } else {
            resultHTML = getJesterAssassinationResultHTML(gameResultInformation.jester, gameResultInformation.assassination);
        }
    }

    resultHTML += `<section><p><span class="resistance">Resistance</span>:</p>`;
    resultHTML += `
        ${gameResultInformation.resistance.map(player => {
            return `<p>(<span class="resistance">${player.role}</span>) ${player.name}</p>`;
        }).join('')}
    `;
    resultHTML += "</section>";

    resultHTML += `<section><p><span class="spy">Spies</span>:</p>`;
    resultHTML += `
        ${gameResultInformation.spies.map(player => {
            return `<p>(<span class="spy">${player.role}</span>) ${player.name}</p>`;
        }).join('')}
    `;
    resultHTML += "</section>";

    return resultHTML;
}

function getJesterAssassinationResultHTML(jester, assassinationInformation) {
    return `
        <h2 class="future-header">${jester.name} wins!</h2>
        <section>
            <p>
                <span class="spy">${assassinationInformation.assassin.name}</span> attempted to assassinate
                ${assassinationInformation.targets.map(target => `<span class="resistance">${target.name}</span>`).join(' and ')}
                as <span class="resistance">${assassinationInformation.role}</span>.
            </p>
            <p>However, <span class="resistance">${jester.name}</span> was the <span class="resistance">Jester</span>.</p>
        </section>
    `;
}

function getCorrectAssassinationResultHTML(assassinationInformation) {
    return `
        <h2 class="future-header"><span class="spy">Spies</span> win!</h2>
        <section>
            <p>
                <span class="spy">${assassinationInformation.assassin.name}</span> correctly assassinated
                ${assassinationInformation.targets.map(target => `<span class="resistance">${target.name}</span>`).join(' and ')}
                as <span class="resistance">${assassinationInformation.role}</span>.
            </p>
        </section>
    `;
}

function getIncorrectAssassinationResultHTML(assassinationInformation, jester, puck) {
    let winnerDescriptor = `<span class="resistance">Resistance</span>`;
    let loserDescriptor = "";

    if (puck) {
        if (puck.won) {
            winnerDescriptor = `
                <span class="resistance">Resistance</span> (including <span class="resistance">${puck.name}</span>
                as <span class="resistance">Puck</span>)
            `;
        } else {
            loserDescriptor = `
                <p>
                    <span class="resistance">${puck.name}</span> failed to extend the game to 5 rounds and has lost
                    as <span class="resistance">Puck</span>!
                </p>
            `;
        }
    }
    if (jester) {
        loserDescriptor += `
            <p>
                <span class="resistance">${jester.name}</span>
                failed to get assassinated and has lost as <span class="resistance">Jester</span>!
            </p>
        `;
    }

    let incorrectAssassinationResultHTML = `
        <h2 class="future-header">${winnerDescriptor} wins!</h2>
        <section>
            <p>
                <span class="spy">${assassinationInformation.assassin.name}</span> incorrectly assassinated
                ${assassinationInformation.targets.map(target => `<span class="resistance">${target.name}</span>`).join(' and ')}
                as <span class="resistance">${assassinationInformation.role}</span>.
            </p>
    `;

    if (loserDescriptor) {
        incorrectAssassinationResultHTML += loserDescriptor;
    }

    incorrectAssassinationResultHTML += "</section>";
    return incorrectAssassinationResultHTML;
}

export {
    socket,
    amHost,
    backButton,
    menuButton,
    menuModal,
    viewHelpButton,
    viewLobbyButton,
    viewRoleButton,
    viewGameButton,
    lobbyContent,
    lobbyPlayers,
    startGameButton,
    closeLobbyButton,
    helpContent,
    gameContent,
    roleContent,
    LOBBY_PLAYER_COUNT_ID,
    createButton,
    createDiv,
    createParagraph,
    createSection,
    createHeaderTwo,
    createLabel,
    createOption,
    createSelect,
    addClassToElement,
    removeClassFromElement,
    hideElement,
    clearChildrenFromElement,
    setButtonDisabled,
    createSimplePlayerListGroupItem,
    clearGameContent,
    createLobbyPlayerList,
    showConductRedemption,
    showConductAssassination,
    showGameResult
}