const ROOT_URL = "https://extavalon.com";

const ROOT_ID = "root";

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
const PLAYER_NAME_ID = "name";
const START_GAME_BUTTON_ID = "start-game-button";
const CLOSE_LOBBY_BUTTON_ID = "close-lobby-button";

const HELP_CONTENT_ID = "help-content";

const GAME_CONTENT_ID = "game-content";
const MISSION_RESULTS_WRAPPER_ID = "mission-results-wrapper"

const ROLE_CONTENT_ID = "role-content";

const SELECT_VOTE_CONTAINER_ID = "select-vote-container";
const SELECT_MISSION_ACTION_CONTAINER_ID = "select-mission-action-container";
const MISSION_ACTIONS_CONTAINER_ID = "mission-actions-container";

const APPROVE_VOTE_TOKEN_SRC = "/images/approve-token.png";
const APPROVE_VOTE_ICON_SRC = "/images/approve-icon.png";
const APPROVE_VOTE_ALT = "Approve Team";
const REJECT_VOTE_TOKEN_SRC = "/images/reject-token.png"
const REJECT_VOTE_ICON_SRC = "/images/reject-icon.png"
const REJECT_VOTE_ALT = "Reject Team";
const SUCCEED_MISSION_IMG_SRC = "/images/success.png";
const SUCCEED_MISSION_IMG_ALT = "Succeed Mission";
const FAIL_MISSION_IMG_SRC = "/images/fail.png";
const FAIL_MISSION_IMG_ALT = "Fail Mission";
const REVERSE_MISSION_IMG_SRC = "/images/reverse.png";
const REVERSE_MISSION_IMG_ALT = "Reverse Mission";
const SUCCESSFUL_MISSION_IMG_SRC = "/images/successful-mission.png";
const SUCCESSFUL_MISSION_IMG_ALT = "Success";
const FAILED_MISSION_IMG_SRC = "/images/failed-mission.png";
const FAILED_MISSION_IMG_ALT = "Fail";

function parseCookie(str) {
    return str.split(';').map(v => v.split('=')).reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

function createButton(text, styleClasses) {
    const buttonElement = document.createElement('button');
    buttonElement.innerText = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            buttonElement.classList.add(styleClass);
        }
    }
    return buttonElement;
}

function createUnordredList(id, styleClasses) {
    const unorderedListElement = document.createElement('ul');
    if (id) {
        unorderedListElement.id = id;
    }
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            unorderedListElement.classList.add(styleClass);
        }
    }
    return unorderedListElement;
}

function createListItem(text, styleClasses) {
    const listElement = document.createElement('li');
    listElement.innerText = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            listElement.classList.add(styleClass);
        }
    }
    return listElement;
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

function createImage(id, src, alt, styleClasses) {
    const imageElement = document.createElement('img');
    if (id) {
        imageElement.id = id;
    }
    imageElement.src = src;
    imageElement.alt = alt;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            imageElement.classList.add(styleClass);
        }
    }
    return imageElement;
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

function createSpan(text, styleClasses) {
    const spanElement = document.createElement('span');
    spanElement.innerHTML = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            spanElement.classList.add(styleClass);
        }
    }
    return spanElement;
}

function createSection(styleClasses) {
    const sectionElement = document.createElement('section');
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            sectionElement.classList.add(styleClass);
        }
    }
    return sectionElement;
}

function createHeader(id, headerType, innerHTML, styleClasses=["future-header"]) {
    const headerElement = document.createElement(headerType);
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

function createHeaderTwo(id, innerHTML, styleClasses=["future-header"]) {
    return createHeader(id, 'h2', innerHTML, styleClasses);
}

function createHeaderThree(id, innerHTML, styleClasses=["future-header"]) {
    return createHeader(id, 'h3', innerHTML, styleClasses);
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

function hideSelect(selectElement) {
    selectElement.selectedIndex = 0;
    selectElement.disabled = true;
    selectElement.style.visibility = "hidden";
}

function reshowSelect(selectElement) {
    selectElement.selectedIndex = 0;
    selectElement.disabled = false;
    selectElement.style.visibility = "visible";
}

document.addEventListener('DOMContentLoaded', function () {
    const {code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    const parsedCookie = parseCookie(document.cookie);

    const userId = parsedCookie.userId;
    const firstName = parsedCookie.firstName;
    const lastName = parsedCookie.lastName;

    const socket = io.connect(`${ROOT_URL}?code=${code}&userId=${userId}&firstName=${firstName}&lastName=${lastName}`);

    // Get elements
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

    backButton.onclick = function() {
        if (gameContent.children.length > 0) {
            hideElement(lobbyContent);
            hideElement(helpContent);
            hideElement(roleContent);
            gameContent.style.display = "flex";
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
        if (gameContent.children.length > 0) {
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
        backButton.style.display = "flex";
    }

    hideElement(backButton);
    hideElement(viewGameButton);
    hideElement(viewRoleButton);
    hideElement(menuModal);
    hideElement(helpContent);
    hideElement(gameContent);
    hideElement(roleContent);

    if (startGameButton) {
        startGameButton.onclick = function () {
            socket.emit('start-game');
        };
        closeLobbyButton.onclick = function () {
            socket.emit('close-lobby');
        };
    }

    // Socket Handlers
    socket.on('update-players', (currentPlayers) => {
        updateLobby(currentPlayers);
    });

    socket.on('setup-game', () => {
        handleSetupGame();
    });

    socket.on('pick-identity', ({possibleResistanceRoles, possibleSpyRoles}) => {
        handlePickIdentity(possibleResistanceRoles, possibleSpyRoles);
    });
    
    socket.on('start-game', (roleHTML) => {
        startGame(roleHTML);
    });

    socket.on('propose-team', (setupProposalInformation) => {
        setupProposal(setupProposalInformation);
    });

    socket.on('update-team', (currentProposedTeamInformation) => {
        updateProposedTeam(currentProposedTeamInformation);
    });

    socket.on('vote-team', (setupVoteInformation) => {
        setupVote(setupVoteInformation);
    });

    socket.on('vote-result', (proposalResultInformation) => {
        showVoteResult(proposalResultInformation);
    });

    socket.on('react', () => {
        showAdvance();
    });

    socket.on('conduct-mission', (conductMissionInformation) => {
        setupMission(conductMissionInformation);
    });

    socket.on('mission-result', ({result, showActions}) => {
        showMissionResult(result);
    });

    socket.on('mission-results', (missionResultsInformation) => {
        updateMissionResults(missionResultsInformation);
    });

    socket.on('conduct-redemption', (conductRedemptionInformation) => {
        handleConductRedemption(conductRedemptionInformation);
    });

    socket.on('conduct-assassination', (conductAssassinationInformation) => {
        handleConductAssassination(conductAssassinationInformation);
    });

    socket.on('game-result', (gameResultInformation) => {
        showGameResult(gameResultInformation);
    });

    socket.on('close-lobby', () => {
        location.replace(`${ROOT_URL}?menu=join`);
    });

    function clearGameContent(clearMissionResults=false) {
        const stopElement = clearMissionResults ? 0 : 1;
        while (gameContent.children.length > stopElement) {
            gameContent.removeChild(gameContent.lastChild);
        }
    }

    // Socket Functions
    function updateLobby(players) {
        const activePlayerCount = players.filter(p => p.active).length;
        document.getElementById(LOBBY_PLAYER_COUNT_ID).innerHTML = `Players [${activePlayerCount}]`;

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

            if (startGameButton && !player.active) {
                const playerKickElement = document.createElement('span');
                playerKickElement.innerHTML = "&times;";
                playerKickElement.classList.add('remove-player-button');
                playerKickElement.onclick = function() {
                    socket.emit('kick-player', i);
                }
                playerListElement.appendChild(playerKickElement);
            }

            lobbyPlayerList.appendChild(playerListElement);
        }

        if (startGameButton) {
            new Sortable(lobbyPlayerList, {
                animation: 350,
                onEnd: function (event) {
                    /*
                    var itemEl = event.item;  // dragged HTMLElement
                    event.to;    // target list
                    event.from;  // previous list
                    event.oldIndex;  // element's old index within old parent
                    event.newIndex;  // element's new index within new parent
                    event.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
                    event.newDraggableIndex; // element's new index within new parent, only counting draggable elements
                    event.clone // the clone element
                    event.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
                    */
                   socket.emit('update-player-index', {oldIndex: event.oldIndex, newIndex: event.newIndex});
                }
            });

            setButtonDisabled(startGameButton, activePlayerCount < 5, false);
        }

        lobbyPlayers.appendChild(lobbyPlayerList);
    }

    function setupGame(setupMessage) {
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
            backButton.title = "Return To Game"
        }

        clearGameContent(true);
        gameContent.appendChild(createHeaderTwo(null, setupMessage, ["future-title"]));
        gameContent.style.display = "flex";        
    }

    function handleSetupGame() {
        setupGame("Waiting for role information...");
    }

    function handlePickIdentity(possibleResistanceRoles, possibleSpyRoles) {
        setupGame("Congratulations, you may select your role/team for this game!");

        const identitySelect = createSelect(null, false);
        identitySelect.appendChild(createOption("Resistance", "Resistance"));
        for (let possibleResistanceRole of possibleResistanceRoles) {
            identitySelect.appendChild(createOption(possibleResistanceRole, `(Resistance) ${possibleResistanceRole}`));
        }
        identitySelect.appendChild(createOption("Spy", "Spy"));
        for (let possibleSpyRole of possibleSpyRoles) {
            identitySelect.appendChild(createOption(possibleSpyRole, `(Spy) ${possibleSpyRole}`));
        }

        const submitIdentitySelectionButton = createButton("Submit", ["future-button"]);
        setButtonDisabled(submitIdentitySelectionButton, true);

        identitySelect.onchange = function () {
            if (identitySelect.selectedIndex !== 0) {
                setButtonDisabled(submitIdentitySelectionButton, false);
                submitIdentitySelectionButton.onclick = function () {
                    handleSubmitIdentitySelection(identitySelect.value);
                };
            } else {
                setButtonDisabled(submitIdentitySelectionButton, true);
            }
        };

        gameContent.appendChild(identitySelect);
        gameContent.appendChild(submitIdentitySelectionButton);
    }

    function handleSubmitIdentitySelection(identitySelection) {
        const identityPickInformation = {
            value: identitySelection
        }
        if (identitySelection === "Resistance" || identitySelection === "Spy") {
            identityPickInformation.type = "Team";
        } else {
            identityPickInformation.type = "Role";
        }
        socket.emit('pick-identity', identityPickInformation);
    }

    function startGame(roleHTML) {
        hideElement(menuModal);
        hideElement(lobbyContent);
        hideElement(helpContent);
        hideElement(gameContent);
        clearGameContent(true);
        roleContent.innerHTML = roleHTML;
        roleContent.style.display = "flex";
        backButton.style.display = "flex";
        viewRoleButton.style.display = "block";

        if (startGameButton) {
            startGameButton.innerHTML = 'New Game';
        }
    }

    function setupProposal(setupProposalInformation) {
        clearGameContent();

        const players = setupProposalInformation.players;
        const requiredTeamSize = setupProposalInformation.requiredTeamSize;

        gameContent.appendChild(createHeaderTwo(null, `Select ${requiredTeamSize} players for the mission:`));

        const proposeTeamContainer = createDiv("propose-team-container");
        const proposedTeamListGroup = createDiv("proposed-team-list-group", ["list-group"]);
        const playerSelections = [];

        const proposeTeamSubmitButton = createButton("Submit", ["future-button"]);
        proposeTeamSubmitButton.onclick = function() {
            setButtonDisabled(proposeTeamSubmitButton, true, false);
            socket.emit('propose-team', playerSelections);
            const otherPlayers = [];
            for (let i = 0; i < proposedTeamListGroup.children.length; i++) {
                const playerListGroupItem = proposedTeamListGroup.children[i];
                const playerId = Number(playerListGroupItem.getAttribute('data-value'));
                if (!playerSelections.includes(playerId)) {
                    otherPlayers.push(playerListGroupItem);
                }
            }
            for (let playerListGroupItem of otherPlayers) {
                proposedTeamListGroup.removeChild(playerListGroupItem);
            }
            proposeTeamContainer.removeChild(proposeTeamSubmitButton);
        };

        for (let player of players) {
            const playerListGroupItem = createDiv(null, ["list-group-item", "clickable"]);
            playerListGroupItem.setAttribute('data-value', player.id);

            const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
            playerListGroupItemLeaderIcon.style.visibility = player.isLeader ? "visible" : "hidden";
            playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

            const playerNameWrapper = createDiv(null, ["name-wrapper"]);
            const playerNameParagraph = createParagraph(player.name);
            playerNameWrapper.appendChild(playerNameParagraph);

            const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
            if (player.isOnTeam) {
                playerListGroupItemGunIcon.style.visibility = "visible";
                playerSelections.push(player.id);
            }
            else {
                playerListGroupItemGunIcon.style.visibility = "hidden";
            }
            playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

            playerListGroupItem.appendChild(playerLeaderSlotWrapper);
            playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));
            playerListGroupItem.appendChild(playerNameWrapper);
            playerListGroupItem.appendChild(playerGunSlotWrapper);
            playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));

            playerListGroupItem.onclick = function() {
                const selected = playerSelections.includes(player.id);
                if (selected) {
                    playerSelections.splice(playerSelections.indexOf(player.id), 1);
                    playerListGroupItemGunIcon.style.visibility = "hidden";
                    socket.emit('update-team', playerSelections);
                } else if (playerSelections.length !== requiredTeamSize) {
                    playerSelections.push(player.id);
                    playerListGroupItemGunIcon.style.visibility = "visible";
                    socket.emit('update-team', playerSelections);
                }

                setButtonDisabled(proposeTeamSubmitButton, playerSelections.length !== requiredTeamSize, false);
            };
            proposedTeamListGroup.appendChild(playerListGroupItem);
        }
        setButtonDisabled(proposeTeamSubmitButton, playerSelections.length !== requiredTeamSize, false);

        proposeTeamContainer.appendChild(proposedTeamListGroup);
        proposeTeamContainer.appendChild(proposeTeamSubmitButton);
        gameContent.appendChild(proposeTeamContainer);
    }

    function updateProposedTeam(currentProposedTeamInformation) {
        clearGameContent();

        const leaderName = currentProposedTeamInformation.leaderName;
        const team = currentProposedTeamInformation.team;

        gameContent.appendChild(createHeaderTwo(null, `${leaderName} is proposing the mission team...`));

        const proposedTeamListGroup = createDiv("proposed-team-list-group", ["list-group"]);

        for (let i = 0; i < team.length; i++) {
            const player = team[i];
            const playerListGroupItem = createDiv(null, ["list-group-item"]);

            const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
            playerListGroupItemLeaderIcon.style.visibility = player.isLeader ? "visible" : "hidden";
            playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

            const playerNameWrapper = createDiv(null, ["name-wrapper"]);
            const playerNameParagraph = createParagraph(player.name);
            playerNameWrapper.appendChild(playerNameParagraph);

            const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
            playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

            playerListGroupItem.appendChild(playerLeaderSlotWrapper);
            playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));
            playerListGroupItem.appendChild(playerNameWrapper);
            playerListGroupItem.appendChild(playerGunSlotWrapper);
            playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));

            proposedTeamListGroup.appendChild(playerListGroupItem);
        }
        
        gameContent.appendChild(proposedTeamListGroup);
    }

    function setupVote(setupVoteInformation) {
        clearGameContent();

        const selectedVote = setupVoteInformation.selectedVote;
        const team = setupVoteInformation.team;
        const applyAffect = setupVoteInformation.applyAffect;

        switch (applyAffect) {
            case "ResistanceProtect":
                gameContent.appendChild(createHeaderTwo(null, `
                    You may select one player below to protect from a <span class="resistance">Resistance</span> bind. Refer to your role information for more details.
                `));
                break;
            case "ResistanceBind":
                gameContent.appendChild(createHeaderTwo(null, `
                    You may select one player below to bind to the <span class="resistance">Resistance</span>. Refer to your role information for more details.
                `));
                break;
            case "SpyProtect":
                gameContent.appendChild(createHeaderTwo(null, `
                    You may select one player below to protect from a <span class="spy">Spy</span> bind. Refer to your role information for more details.
                `));
                break;
            case "SpyBind":
                gameContent.appendChild(createHeaderTwo(null, `
                    You may select one player below to bind to the <span class="spy">Spies</span>. Refer to your role information for more details.
                `));
                break;
        }

        const proposedTeamListGroup = createDiv("proposed-team-list-group", ["list-group"]);

        for (let i = 0; i < team.length; i++) {
            const player = team[i];
            const playerListGroupItem = createDiv(null, ["list-group-item"]);

            const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
            playerListGroupItemLeaderIcon.style.visibility = player.isLeader ? "visible" : "hidden";
            playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

            const playerAffectSlotWrapper = createDiv(null, ["icon-wrapper"]);
            let playerListGroupItemAffectIconSrc = null;
            if (player.affect) {
                if (player.affect.name === "Bind") {
                    if (player.affect.type === "Resistance") {
                        playerListGroupItemAffectIconSrc = "/images/resistance-bind.png";
                    } else if (player.affect.type === "Spy") {
                        playerListGroupItemAffectIconSrc = "/images/spy-bind.png";
                    } else {
                        playerListGroupItemAffectIconSrc = "/images/unknown-bind.png";
                    }
                } else if (player.affect.name === "Protect") {
                    if (player.affect.type === "Resistance") {
                        playerListGroupItemAffectIconSrc = "/images/spy-protect.png";
                    } else if (player.affect.type === "Spy") {
                        playerListGroupItemAffectIconSrc = "/images/resistance-protect.png";
                    } else {
                        playerListGroupItemAffectIconSrc = "/images/unknown-protect.png";
                    }
                }
            }
            if (playerListGroupItemAffectIconSrc) {
                const playerListGroupItemAffectIcon = createImage(null, playerListGroupItemAffectIconSrc, "Affect Slot", ["affect-icon"]);
                playerAffectSlotWrapper.appendChild(playerListGroupItemAffectIcon);
            }

            const playerNameWrapper = createDiv(null, ["name-wrapper"]);
            const playerNameParagraph = createParagraph(player.name);
            playerNameWrapper.appendChild(playerNameParagraph);

            const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
            playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

            playerListGroupItem.appendChild(playerLeaderSlotWrapper);
            playerListGroupItem.appendChild(playerAffectSlotWrapper);
            playerListGroupItem.appendChild(playerNameWrapper);
            playerListGroupItem.appendChild(playerGunSlotWrapper);
            playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));

            if (applyAffect) {
                playerListGroupItem.onclick = function() {
                    socket.emit('toggle-affect', {playerId: player.id});
                };
            }

            proposedTeamListGroup.appendChild(playerListGroupItem);
        }
        
        gameContent.appendChild(proposedTeamListGroup);

        const selectVoteContainer = createDiv(SELECT_VOTE_CONTAINER_ID);
        const approveTeamImage = createImage(null, APPROVE_VOTE_TOKEN_SRC, APPROVE_VOTE_ALT, ['vote-image', 'clickable']);
        approveTeamImage.onclick = function() {
            handleProposalVoteSelection(selectVoteContainer.children, approveTeamImage, true);
        }
        selectVoteContainer.appendChild(approveTeamImage);

        const rejectTeamImage = createImage(null, REJECT_VOTE_TOKEN_SRC, REJECT_VOTE_ALT, ['vote-image', 'clickable']);
        rejectTeamImage.onclick = function() {
            handleProposalVoteSelection(selectVoteContainer.children, rejectTeamImage, false);
        }
        selectVoteContainer.appendChild(rejectTeamImage);

        if (selectedVote === true) {
            approveTeamImage.classList.add("selected-image");
        } else if (selectedVote == false) {
            rejectTeamImage.classList.add("selected-image");
        }
        gameContent.appendChild(selectVoteContainer);
    }

    function handleProposalVoteSelection(voteOptions, selectedOption, selectedVote) {
        for (let option of voteOptions) {
            if (option.alt === selectedOption.alt) {
                addClassToElement(option, "selected-image");
            } else {
                removeClassFromElement(option, "selected-image");
            }
        }
        socket.emit('vote-team', selectedVote);
    }

    function showAdvance() {
        let advanceButton = document.getElementById("advance-button");
        if (!advanceButton) {
            showButton("Advance", function () {
                socket.emit('advance-mission');
            });
        }
    }

    function showButton(text, handleClick) {
        const button = createButton(text, ["future-button"]);
        button.onclick = handleClick;
        gameContent.appendChild(button);
    }

    function showVoteResult(proposalResultInformation) {
        clearGameContent();

        if (proposalResultInformation.result) {
            gameContent.appendChild(createHeaderTwo(null, "Proposal Approved!"));
        } else {
            gameContent.appendChild(createHeaderTwo(null, "Proposal Rejected!"));
        }

        const proposalVotesContainer = createDiv("proposal-votes-container");
        const proposalVotesListGroup = createDiv("proposal-votes-list-group", ["list-group"]);

        for (let playerVoteInformation of proposalResultInformation.voteInformation) {
            const playerListGroupItem = createDiv(null, ["list-group-item"]);

            const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
            playerListGroupItemLeaderIcon.style.visibility = playerVoteInformation.isLeader ? "visible" : "hidden";
            playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

            const playerAffectSlotWrapper = createDiv(null, ["icon-wrapper"]);
            let playerListGroupItemAffectIconSrc = null;
            if (playerVoteInformation.affect) {
                if (playerVoteInformation.affect.name === "Bind") {
                    if (playerVoteInformation.affect.type === "Resistance") {
                        playerListGroupItemAffectIconSrc = "/images/resistance-bind.png";
                    } else if (playerVoteInformation.affect.type === "Spy") {
                        playerListGroupItemAffectIconSrc = "/images/spy-bind.png";
                    } else {
                        playerListGroupItemAffectIconSrc = "/images/unknown-bind.png";
                    }
                } else if (playerVoteInformation.affect.name === "Protect") {
                    if (playerVoteInformation.affect.type === "Resistance") {
                        playerListGroupItemAffectIconSrc = "/images/spy-protect.png";
                    } else if (playerVoteInformation.affect.type === "Spy") {
                        playerListGroupItemAffectIconSrc = "/images/resistance-protect.png";
                    } else {
                        playerListGroupItemAffectIconSrc = "/images/unknown-protect.png";
                    }
                }
            }
            if (playerListGroupItemAffectIconSrc) {
                const playerListGroupItemAffectIcon = createImage(null, playerListGroupItemAffectIconSrc, "Affect Slot", ["affect-icon"]);
                playerAffectSlotWrapper.appendChild(playerListGroupItemAffectIcon);
            }

            const playerNameWrapper = createDiv(null, ["name-wrapper"]);
            const playerNameParagraph = createParagraph(playerVoteInformation.name);
            playerNameWrapper.appendChild(playerNameParagraph);

            const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
            playerListGroupItemGunIcon.style.visibility = playerVoteInformation.isOnTeam ? "visible" : "hidden";
            playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

            const playerVoteSlotWrapper = createDiv(null, ["icon-wrapper"]);
            if (playerVoteInformation.vote) {
                playerVoteSlotWrapper.appendChild(createImage(null, APPROVE_VOTE_ICON_SRC, "Vote Slot", ["vote-icon"]))
            } else {
                playerVoteSlotWrapper.appendChild(createImage(null, REJECT_VOTE_ICON_SRC, "Vote Slot", ["vote-icon"]))
            }

            playerListGroupItem.appendChild(playerLeaderSlotWrapper);
            playerListGroupItem.appendChild(playerAffectSlotWrapper);
            playerListGroupItem.appendChild(playerNameWrapper);
            playerListGroupItem.appendChild(playerGunSlotWrapper);
            playerListGroupItem.appendChild(playerVoteSlotWrapper);

            proposalVotesListGroup.appendChild(playerListGroupItem);
        }

        proposalVotesContainer.appendChild(proposalVotesListGroup);
        gameContent.appendChild(proposalVotesContainer);
    }

    function setupMission(conductMissionInformation) {
        clearGameContent();

        if (conductMissionInformation) {
            if (conductMissionInformation.sirRobinIntel !== undefined) {
                if (conductMissionInformation.sirRobinIntel) {
                    gameContent.appendChild(createHeaderTwo(null, `
                        <span class="resistance">${conductMissionInformation.sirRobinIntel}</span> from the mission team is <span class="resistance">Resistance</span>.
                    `));
                } else {
                    gameContent.appendChild(createHeaderTwo(null, `
                        You either already know all the <span class="resistance">Resistance</span> players on this mission team
                        OR <span class="spy">Accolon</span> (if present) is on this mission team.
                    `));
                }
            }

            if (conductMissionInformation.resistanceBound) {
                gameContent.appendChild(createHeaderTwo(null, `
                    You have been <span class="resistance">Resistance</span> bounded for this mission! You can only play a success card.
                `));
            } else if (conductMissionInformation.spyBound) {
                gameContent.appendChild(createHeaderTwo(null, `
                    You have been <span class="spy">Spy</span> bounded for this mission! You can only play a fail card.
                `));
            } else if (conductMissionInformation.spySuggestion) {
                gameContent.appendChild(createHeaderTwo(null, `
                    Your <span class="spy">Spy</span> intuition says you should play a ${conductMissionInformation.spySuggestion.join(" or ")} card.
                `));
            }

            const successAllowed = conductMissionInformation.successAllowed;
            const failAllowed = conductMissionInformation.failAllowed;
            const reverseAllowed = conductMissionInformation.reverseAllowed;

            const selectMissionActionContainer = createDiv(SELECT_MISSION_ACTION_CONTAINER_ID);
            gameContent.appendChild(selectMissionActionContainer);
    
            if (successAllowed) {
                const successMissionActionImage = createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ['action-image', 'clickable']);
                successMissionActionImage.onclick = function () {
                    handleMissionActionSelection(selectMissionActionContainer.children, successMissionActionImage, 'Succeed');
                };
                selectMissionActionContainer.appendChild(successMissionActionImage);
            }
    
            if (failAllowed) {
                const failMissionActionImage = createImage(null, FAIL_MISSION_IMG_SRC, FAIL_MISSION_IMG_ALT, ['action-image', 'clickable']);
                failMissionActionImage.onclick = function () {
                    handleMissionActionSelection(selectMissionActionContainer.children, failMissionActionImage, 'Fail');
                };
                selectMissionActionContainer.appendChild(failMissionActionImage);
            }
    
            if (reverseAllowed) {
                const reverseMissionActionImage = createImage(null, REVERSE_MISSION_IMG_SRC, REVERSE_MISSION_IMG_ALT, ['action-image', 'clickable']);
                reverseMissionActionImage.onclick = function () {
                    handleMissionActionSelection(selectMissionActionContainer.children, reverseMissionActionImage, 'Reverse');
                };
                selectMissionActionContainer.appendChild(reverseMissionActionImage);
            }
        } else {
            gameContent.appendChild(createHeaderTwo(null, `Waiting for mission to finish...`));
        }
    }

    function handleMissionActionSelection(actionOptions, selectedOption, selectedAction) {
        for (let option of actionOptions) {
            if (option.alt === selectedOption.alt) {
                addClassToElement(option, "selected-image");
            } else {
                removeClassFromElement(option, "selected-image");
            }
        }
        showConfirmMissionAction(selectedAction);
    }

    function showConfirmMissionAction(action) {
        const gameContentButtons = gameContent.getElementsByTagName("button");
        if (gameContentButtons.length === 0) {
            showButton("Confirm", function () {
                handleConfirmMissionActionClick(action);
            });
        } else {
            gameContentButtons[0].onclick = function () {
                handleConfirmMissionActionClick(action);
            };
        }
    }

    function handleConfirmMissionActionClick(action) {
        socket.emit('conduct-mission', action);
        clearGameContent();
        gameContent.appendChild(createHeaderTwo(null, `Waiting for mission to finish...`));
    }

    function showMissionResult(missionResultInformation) {
        clearGameContent();

        if (missionResultInformation.result === "Success") {
            gameContent.appendChild(createHeaderTwo(null, `Mission successful!`));
        } else {
            gameContent.appendChild(createHeaderTwo(null, `Mission failed!`));
        }

        const totalActions = missionResultInformation.successCount + missionResultInformation.failCount + missionResultInformation.reverseCount;
        const rowSize = totalActions === 4 ? 2 : 3;
        let actionsAdded = 0;

        const missionActionsContainer = createDiv(MISSION_ACTIONS_CONTAINER_ID);
        let currentActionsRow = null;

        for (let i = 0; i < missionResultInformation.successCount; i++) {
            if (actionsAdded % rowSize === 0) {
                if (currentActionsRow) {
                    missionActionsContainer.appendChild(currentActionsRow);
                }
                currentActionsRow = createDiv("mission-actions-row");
            }
            currentActionsRow.appendChild(createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ["action-image"]));
            actionsAdded += 1;
        }
        for (let i = 0; i < missionResultInformation.failCount; i++) {
            if (actionsAdded % rowSize === 0) {
                if (currentActionsRow) {
                    missionActionsContainer.appendChild(currentActionsRow);
                }
                currentActionsRow = createDiv("mission-actions-row");
            }
            currentActionsRow.appendChild(createImage(null, FAIL_MISSION_IMG_SRC, FAIL_MISSION_IMG_ALT, ["action-image"]));
            actionsAdded += 1;
        }
        for (let i = 0; i < missionResultInformation.reverseCount; i++) {
            if (actionsAdded % rowSize === 0) {
                if (currentActionsRow) {
                    missionActionsContainer.appendChild(currentActionsRow);
                }
                currentActionsRow = createDiv("mission-actions-row");
            }
            currentActionsRow.appendChild(createImage(null, REVERSE_MISSION_IMG_SRC, REVERSE_MISSION_IMG_ALT, ["action-image"]));
            actionsAdded += 1;
        }

        missionActionsContainer.appendChild(currentActionsRow);
        gameContent.appendChild(missionActionsContainer);
    }

    function updateMissionResults(missionResultsInformation) {
        let missionResultsWrapper = document.getElementById(MISSION_RESULTS_WRAPPER_ID);
        if (!missionResultsWrapper) {
            missionResultsWrapper = createDiv(MISSION_RESULTS_WRAPPER_ID, []);
            gameContent.insertBefore(missionResultsWrapper, gameContent.firstChild);
        }

        clearChildrenFromElement(missionResultsWrapper);
        for (let missionInformation of missionResultsInformation.missions) {
            const missionResultWrapper = createDiv(null, ["mission-result-wrapper"]);
            if (missionInformation.result) {
                if (missionInformation.result === 'Success') {
                    missionResultWrapper.appendChild(createImage(null, SUCCESSFUL_MISSION_IMG_SRC, SUCCESSFUL_MISSION_IMG_ALT));
                } else {
                    missionResultWrapper.appendChild(createImage(null, FAILED_MISSION_IMG_SRC, FAILED_MISSION_IMG_ALT));
                }
            } else {
                let spanText = "";
                switch (missionInformation.teamSize) {
                    case 2:
                        spanText = "&#9313;";
                        break;
                    case 3:
                        spanText = "&#9314;";
                        break;
                    case 4:
                        spanText = "&#9315;";
                        break;
                    case 5:
                        spanText = "&#9316;";
                        break;
                    case 6:
                        spanText = "&#9317;";
                        break;
                }
                missionResultWrapper.appendChild(createParagraph(spanText));
            }
            missionResultsWrapper.appendChild(missionResultWrapper);
        }
    }

    function handleConductRedemption(conductRedemptionInformation) {
        clearGameContent();

        if ('kay' in conductRedemptionInformation) {
            gameContent.appendChild(createHeaderTwo(null, `
                ${conductRedemptionInformation.kay} is attempting to redeem the <span class="resistance">Resistance</span>...
            `));
        } else {
            gameContent.appendChild(createHeaderTwo(null, `
                Select the players you think are the <span class="spy">spies</span>:
            `));

            const players = conductRedemptionInformation.players;

            const redemptionPlayersContainer = createDiv("redemption-players-container");
            const redemptionPlayersListGroup = createDiv("redemption-players-list-group", ["list-group"]);
            let playerSelections = [];
            const requiredPlayerCount = conductRedemptionInformation.spyCount;

            const redemptionPlayersSubmitButton = createButton("Submit", ["future-button"]);
            redemptionPlayersSubmitButton.onclick = function() {
                setButtonDisabled(redemptionPlayersSubmitButton, true, false);
                const conductRedemptionInformation = {
                    ids: playerSelections
                };
                socket.emit('conduct-redemption', conductRedemptionInformation);
            };

            for (let player of players) {
                const playerListGroupItem = createDiv(null, ["list-group-item", "clickable"]);

                const playerNameWrapper = createDiv(null, ["name-wrapper"]);
                const playerNameParagraph = createParagraph(player.name);
                playerNameWrapper.appendChild(playerNameParagraph);

                playerListGroupItem.appendChild(playerNameWrapper);

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
    }

    function handleConductAssassination(conductAssassinationInformation) {
        clearGameContent();

        if ('assassin' in conductAssassinationInformation) {
            gameContent.appendChild(createHeaderTwo(null, `${conductAssassinationInformation.assassin} is choosing who to assassinate...`));
        } else {
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

            const assassinationPlayersSubmitButton = createButton("Submit", ["future-button"]);
            assassinationPlayersSubmitButton.onclick = function() {
                setButtonDisabled(assassinationPlayersSubmitButton, true, false);
                const conductAssassinationInformation = {
                    ids: playerSelections,
                    role: assassinationRoleSelect.value
                };
                socket.emit('conduct-assassination', conductAssassinationInformation);
            };

            for (let player of players) {
                const playerListGroupItem = createDiv(null, ["list-group-item", "clickable"]);

                const playerNameWrapper = createDiv(null, ["name-wrapper"]);
                const playerNameParagraph = createParagraph(player.name);
                playerNameWrapper.appendChild(playerNameParagraph);

                playerListGroupItem.appendChild(playerNameWrapper);

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
    }

    function showGameResult(gameResultInformation) {
        clearGameContent();
        gameContent.innerHTML += buildGameResultHTML(gameResultInformation);
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
});
