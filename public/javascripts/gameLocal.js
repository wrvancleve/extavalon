//const ROOT_URL = "https://extavalon.com";
const ROOT_URL = "http://192.168.1.107:25565";

const ROOT_ID = "root";
const LOBBY_ID = "lobby";
const LOBBY_INFORMATION_ID = "lobby-information";
const TOGGLE_LOBBY_INFORMATION_BUTTON_ID = "toggle-lobby-information-button";
const LOBBY_PLAYERS_ID = "lobby-players";
const LOBBY_PLAYER_COUNT_ID = "lobby-player-count";
const LOBBY_PLAYER_LIST_ID = "lobby-player-list";
const PLAYER_NAME_ID = "name";
const ROLES_MODAL_ID = "roles-modal";
const OPEN_ROLES_MODAL_BUTTON_ID = "open-roles-modal-button";
const CLOSE_ROLES_MODAL_BUTTON_ID = "close-roles-modal-button";
const INTEL_MODAL_ID = "intel-modal";
const INTEL_MODAL_AREA_ID = "intel-modal-area";
const OPEN_INTEL_MODAL_BUTTON_ID = "open-intel-modal-button";
const CLOSE_INTEL_MODAL_BUTTON_ID = "close-intel-modal-button";
const START_GAME_BUTTON_ID = "start-game-button";
const CLOSE_LOBBY_BUTTON_ID = "close-lobby-button";
const GAME_INFORMATION_ID = "game-information";
const STATUS_HEADER_ID = "status-header";
const MISSION_RESULTS_CONTAINER_ID = "mission-results-container";
const SELECT_VOTE_CONTAINER_ID = "select-vote-container";
const SELECT_MISSION_ACTION_CONTAINER_ID = "select-mission-action-container";
const MISSION_ACTIONS_CONTAINER_ID = "mission-actions-container";
const SUBMIT_RESULTS_MODAL_ID = "submit-results-modal";

const APPROVE_VOTE_IMG_SRC = "/images/approve.png";
const APPROVE_VOTE_IMG_ALT = "Approve Team";
const REJECT_VOTE_IMG_SRC = "/images/reject.png"
const REJECT_VOTE_IMG_ALT = "Reject Team";
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

function createHeaderTwo(id, innerHTML, styleClasses=["future-header"]) {
    const headerTwoElement = document.createElement('h2');
    if (id) {
        headerTwoElement.id = id;
    }
    headerTwoElement.innerHTML = innerHTML;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            headerTwoElement.classList.add(styleClass);
        }
    }
    return headerTwoElement;
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
    const root = document.getElementById(ROOT_ID);
    const lobby = document.getElementById(LOBBY_ID);
    const lobbyInformation = document.getElementById(LOBBY_INFORMATION_ID);
    const lobbyPlayers = document.getElementById(LOBBY_PLAYERS_ID);
    const toggleLobbyInformationButton = document.getElementById(TOGGLE_LOBBY_INFORMATION_BUTTON_ID);
    const rolesModal = document.getElementById(ROLES_MODAL_ID);
    const openRolesModalButton = document.getElementById(OPEN_ROLES_MODAL_BUTTON_ID);
    const closeRolesModalButton = document.getElementById(CLOSE_ROLES_MODAL_BUTTON_ID);
    const intelModal = document.getElementById(INTEL_MODAL_ID);
    const intelModalArea = document.getElementById(INTEL_MODAL_AREA_ID);
    const openIntelModalButton = document.getElementById(OPEN_INTEL_MODAL_BUTTON_ID);
    const closeIntelModalButton = document.getElementById(CLOSE_INTEL_MODAL_BUTTON_ID);
    const startGameButton = document.getElementById(START_GAME_BUTTON_ID);
    const closeLobbyButton = document.getElementById(CLOSE_LOBBY_BUTTON_ID);
    const gameInformation = document.getElementById(GAME_INFORMATION_ID);

    // Setup Page
    openIntelModalButton.onclick = function() {
        if (intelModal.style.display === "flex") {
            intelModal.style.display = "none";
        } else {
            hideElement(rolesModal);
            intelModal.style.display = "flex";
        }
    }
    closeIntelModalButton.onclick = function() {
        intelModal.style.display = "none";
    }
    intelModal.style.display = "none";
    openIntelModalButton.style.display = 'none';

    if (toggleLobbyInformationButton) {
        toggleLobbyInformationButton.onclick = function() {
            if (lobbyInformation.style.display === "none") {
                lobbyInformation.style.display = "block";
                startGameButton.style.display = 'block';
                closeLobbyButton.style.display = "block";
            } else {
                lobbyInformation.style.display = "none";
                startGameButton.style.display = 'none';
                closeLobbyButton.style.display = "none";
            }
        }
        toggleLobbyInformationButton.style.display = "none";
    }

    openRolesModalButton.onclick = function() {
        if (rolesModal.style.display === "none") {
            rolesModal.style.display = "block";
            hideElement(intelModal);
        }
        else {
            rolesModal.style.display = "none";
        }
    }
    closeRolesModalButton.onclick = function() {
        rolesModal.style.display = "none";
    }
    rolesModal.style.display = "none";

    if (startGameButton) {
        startGameButton.onclick = function () {
            openIntelModalButton.style.display = "none";
            toggleLobbyInformationButton.style.display = "none";
            startGameButton.style.display = 'none';
            closeLobbyButton.style.display = "none";
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
    
    socket.on('start-game', (gameHTML) => {
        startGame(gameHTML);
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

    socket.on('conduct-assassination', (conductAssassinationInformation) => {
        handleConductAssassination(conductAssassinationInformation);
    });

    socket.on('game-result', ({winner, resultHTML}) => {
        showGameResult(resultHTML);
    });

    socket.on('close-lobby', () => {
        location.replace(`${ROOT_URL}?menu=join`);
    });

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

    function setupGame() {
        lobbyInformation.style.display = "none";
        openIntelModalButton.style.display = "none";
        intelModal.style.display = "none";
        clearChildrenFromElement(gameInformation);

        let missionResultsContainer = document.getElementById(MISSION_RESULTS_CONTAINER_ID);
        if (missionResultsContainer) {
            lobby.removeChild(missionResultsContainer);
        }
    }

    function handleSetupGame() {
        setupGame();
        updateStatusHeader("Waiting for role information...");
    }

    function handlePickIdentity(possibleResistanceRoles, possibleSpyRoles) {
        setupGame();
        updateStatusHeader("Congratulations, you may select your role/team for this game!");

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

        gameInformation.appendChild(identitySelect);
        gameInformation.appendChild(submitIdentitySelectionButton);
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

    function startGame(gameHTML) {
        lobbyInformation.style.display = "none";
        clearChildrenFromElement(gameInformation);

        if (toggleLobbyInformationButton) {
            toggleLobbyInformationButton.style.display = "block";
        }
        openIntelModalButton.style.display = "block";
        intelModalArea.innerHTML = gameHTML;
        intelModal.style.display = "flex";

        if (startGameButton) {
            startGameButton.innerHTML = 'New Game';
            startGameButton.style.display = 'none';
            closeLobbyButton.style.display = "none";
        }
    }

    function updateStatusHeader(message) {
        let statusHeader = document.getElementById(STATUS_HEADER_ID);
        if (!statusHeader) {
            statusHeader = createHeaderTwo(STATUS_HEADER_ID, message);
            gameInformation.insertBefore(statusHeader, gameInformation.firstChild);
        } else {
            statusHeader.innerHTML = message;
        }
    }

    function createProposalPlayerListGroup(players, maxSelections) {
        const playerListGroup = createDiv("player-list-group", ["list-group"]);
        const playerSelections = [];


    }

    function setupProposal(setupProposalInformation) {
        clearChildrenFromElement(gameInformation);

        const leader = setupProposalInformation.leader;
        const players = setupProposalInformation.players;
        const requiredTeamSize = setupProposalInformation.requiredTeamSize;
        const currentProposedTeam = setupProposalInformation.currentProposedTeam;

        updateStatusHeader(`Select ${requiredTeamSize} players to go on the mission:`);

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

        for (let player of currentProposedTeam) {
            playerSelections.push(player.id);
        }

        for (let player of players) {
            const playerListGroupItem = createDiv(null, ["list-group-item", "clickable"]);
            playerListGroupItem.setAttribute('data-value', player.id);

            const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
            playerListGroupItemLeaderIcon.style.visibility = player.id === leader.id ? "visible" : "hidden";
            playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

            const playerNameWrapper = createDiv(null, ["name-wrapper"]);
            const playerNameParagraph = createParagraph(player.name);
            playerNameWrapper.appendChild(playerNameParagraph);

            const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
            const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
            playerListGroupItemGunIcon.style.visibility = playerSelections.includes(player.id) ? "visible" : "hidden";
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
        gameInformation.appendChild(proposeTeamContainer);
    }

    function updateProposedTeam(currentProposedTeamInformation) {
        clearChildrenFromElement(gameInformation);

        const leaderName = currentProposedTeamInformation.leaderName;
        const team = currentProposedTeamInformation.team;

        updateStatusHeader(`${leaderName} is proposing the mission team...`);

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
        
        gameInformation.appendChild(proposedTeamListGroup);
    }

    function setupVote(setupVoteInformation) {
        clearChildrenFromElement(gameInformation);

        const selectedVote = setupVoteInformation.selectedVote;
        const team = setupVoteInformation.team;
        const applyAffect = setupVoteInformation.applyAffect;

        switch (applyAffect) {
            case "ResistanceProtect":
                gameInformation.appendChild(createHeaderTwo(null, `
                    You may select one player below to protect from a <span class="resistance">Resistance</span> bind. Refer to your role information for more details.
                `));
                break;
            case "ResistanceBind":
                gameInformation.appendChild(createHeaderTwo(null, `
                    You may select one player below to bind to the <span class="resistance">Resistance</span>. Refer to your role information for more details.
                `));
                break;
            case "SpyProtect":
                gameInformation.appendChild(createHeaderTwo(null, `
                    You may select one player below to protect from a <span class="spy">Spy</span> bind. Refer to your role information for more details.
                `));
                break;
            case "SpyBind":
                gameInformation.appendChild(createHeaderTwo(null, `
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
                        playerListGroupItemAffectIconSrc = "/images/resistance-protect.png";
                    } else if (player.affect.type === "Spy") {
                        playerListGroupItemAffectIconSrc = "/images/spy-protect.png";
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
        
        gameInformation.appendChild(proposedTeamListGroup);

        gameInformation.appendChild(createHeaderTwo(null, "Vote on the mission team above:"));

        const selectVoteContainer = createDiv(SELECT_VOTE_CONTAINER_ID);
        const approveTeamImage = createImage(null, APPROVE_VOTE_IMG_SRC, APPROVE_VOTE_IMG_ALT, ['vote-image', 'clickable']);
        approveTeamImage.onclick = function() {
            handleProposalVoteSelection(selectVoteContainer.children, approveTeamImage, true);
        }
        selectVoteContainer.appendChild(approveTeamImage);

        const rejectTeamImage = createImage(null, REJECT_VOTE_IMG_SRC, REJECT_VOTE_IMG_ALT, ['vote-image', 'clickable']);
        rejectTeamImage.onclick = function() {
            handleProposalVoteSelection(selectVoteContainer.children, rejectTeamImage, false);
        }
        selectVoteContainer.appendChild(rejectTeamImage);

        if (selectedVote === true) {
            approveTeamImage.classList.add("selected-image");
        } else if (selectedVote == false) {
            rejectTeamImage.classList.add("selected-image");
        }
        gameInformation.appendChild(selectVoteContainer);
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
        gameInformation.appendChild(button);
    }

    function showVoteResult(proposalResultInformation) {
        clearChildrenFromElement(gameInformation);

        if (proposalResultInformation.result) {
            updateStatusHeader("Proposal Approved!");
        } else {
            updateStatusHeader("Proposal Rejected!");
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
                        playerListGroupItemAffectIconSrc = "/images/resistance-protect.png";
                    } else if (player.affect.type === "Spy") {
                        playerListGroupItemAffectIconSrc = "/images/spy-protect.png";
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
                playerVoteSlotWrapper.appendChild(createParagraph("&#10003;", ["approved-color"]));
            } else {
                playerVoteSlotWrapper.appendChild(createParagraph("&#10005;", ["rejected-color"]));
            }

            playerListGroupItem.appendChild(playerLeaderSlotWrapper);
            playerListGroupItem.appendChild(playerAffectSlotWrapper);
            playerListGroupItem.appendChild(playerNameWrapper);
            playerListGroupItem.appendChild(playerGunSlotWrapper);
            playerListGroupItem.appendChild(playerVoteSlotWrapper);

            proposalVotesListGroup.appendChild(playerListGroupItem);
        }

        proposalVotesContainer.appendChild(proposalVotesListGroup);
        gameInformation.appendChild(proposalVotesContainer);
    }

    function setupMission(conductMissionInformation) {
        clearChildrenFromElement(gameInformation);

        if (conductMissionInformation) {
            const missionActionDisclaimer = conductMissionInformation.disclaimer;
            if (missionActionDisclaimer) {
                updateStatusHeader(missionActionDisclaimer);
            } else {
                updateStatusHeader("Select a mission action:");
            }

            const successAllowed = conductMissionInformation.successAllowed;
            const failAllowed = conductMissionInformation.failAllowed;
            const reverseAllowed = conductMissionInformation.reverseAllowed;

            const selectMissionActionContainer = createDiv(SELECT_MISSION_ACTION_CONTAINER_ID);
            gameInformation.appendChild(selectMissionActionContainer);
    
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
            updateStatusHeader("Waiting for mission to finish...");
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
        const gameInformationButtons = gameInformation.getElementsByTagName("button");
        if (gameInformationButtons.length === 0) {
            showButton("Confirm", function () {
                handleConfirmMissionActionClick(action);
            });
        } else {
            gameInformationButtons[0].onclick = function () {
                handleConfirmMissionActionClick(action);
            };
        }
    }

    function handleConfirmMissionActionClick(action) {
        socket.emit('conduct-mission', action);
        clearChildrenFromElement(gameInformation);
        updateStatusHeader("Waiting for mission to finish...");
    }

    function showMissionResult(missionResultInformation) {
        clearChildrenFromElement(gameInformation);

        if (missionResultInformation.result === "Success") {
            updateStatusHeader("Mission successful!");
        } else {
            updateStatusHeader("Mission failed!");
        }

        const missionActionsContainer = createDiv(MISSION_ACTIONS_CONTAINER_ID);
        gameInformation.appendChild(missionActionsContainer);
        for (let i = 0; i < missionResultInformation.successCount; i++) {
            missionActionsContainer.appendChild(createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ["action-image"]));
        }
        for (let i = 0; i < missionResultInformation.failCount; i++) {
            missionActionsContainer.appendChild(createImage(null, FAIL_MISSION_IMG_SRC, FAIL_MISSION_IMG_ALT, ["action-image"]));
        }
        for (let i = 0; i < missionResultInformation.reverseCount; i++) {
            missionActionsContainer.appendChild(createImage(null, REVERSE_MISSION_IMG_SRC, REVERSE_MISSION_IMG_ALT, ["action-image"]));
        }
    }

    function updateMissionResults(missionResultsInformation) {
        let missionResultsContainer = document.getElementById(MISSION_RESULTS_CONTAINER_ID);
        if (!missionResultsContainer) {
            missionResultsContainer = createDiv(MISSION_RESULTS_CONTAINER_ID, []);
            lobby.insertBefore(missionResultsContainer, lobby.firstChild);
        }

        clearChildrenFromElement(missionResultsContainer);
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
            missionResultsContainer.appendChild(missionResultWrapper);
        }
    }

    function handleConductAssassination(conductAssassinationInformation) {
        clearChildrenFromElement(gameInformation);

        if ('assassin' in conductAssassinationInformation) {
            updateStatusHeader(`${conductAssassinationInformation.assassin} is choosing who to assassinate...`);
        } else {
            updateStatusHeader("Select role and player(s) to assassinate for:");

            const assassinationRoleContainer = createDiv("assassination-role-container", ["center-flex-row"]);
            const assassinationRoleLabel = createLabel("assassination-role-select", "Role:");
            const assassinationRoleSelect = createSelect("assassination-role-select", false);
            assassinationRoleSelect.appendChild(createOption("Merlin", "Merlin"));
            assassinationRoleSelect.appendChild(createOption("Arthur", "Arthur"));
            assassinationRoleSelect.appendChild(createOption("Lovers", "Tristan & Iseult"));
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

            gameInformation.appendChild(assassinationRoleContainer);
            assassinationPlayersContainer.appendChild(assassinationPlayersListGroup);
            gameInformation.appendChild(assassinationPlayersContainer);
            gameInformation.appendChild(assassinationPlayersSubmitButton);
        }
    }

    function showGameResult(gameResultInformation) {
        clearChildrenFromElement(gameInformation);
        gameInformation.innerHTML = buildGameResultHTML(gameResultInformation);

        if (startGameButton) {
            startGameButton.style.display = 'block';
            closeLobbyButton.style.display = "block";
        }
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
            ${this.spies.map(player => {
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
                    <span class="resistance">${puck.name}</span> failed to extend the game to 5 rounds and has lost
                    as <span class="resistance">Puck</span>!
                `;
            }
        } else if (jester) {
            loserDescriptor = `
                <span class="resistance">${jester.name}</span>
                failed to get assassinated and has lost as <span class="resistance">Jester</span>!
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
            incorrectAssassinationResultHTML += `<p>${loserDescriptor}</p>`;
        }
    
        incorrectAssassinationResultHTML += "</section>";
        return incorrectAssassinationResultHTML;
    }
});
