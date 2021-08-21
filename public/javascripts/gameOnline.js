const ROOT_URL = "https://extavalon.com";
//const ROOT_URL = "http://192.168.1.107:25565";

const LOBBY_INFORMATION_ID = "lobby-information";
const TOGGLE_HOST_INFORMATION_BUTTON_ID = "toggle-host-information-button";
const LOBBY_PLAYER_COUNT_ID = "lobby-player-count";
const LOBBY_PLAYER_LIST_ID = "lobby-player-list";

const ROLES_MODAL_ID = "roles-modal";
const OPEN_ROLES_MODAL_BUTTON_ID = "open-roles-modal-button";
const CLOSE_ROLES_MODAL_BUTTON_ID = "close-roles-modal-button";

const INTEL_MODAL_ID = "intel-modal";
const INTEL_MODAL_AREA_ID = "intel-modal-area";
const OPEN_INTEL_MODAL_BUTTON_ID = "open-intel-modal-button";
const CLOSE_INTEL_MODAL_BUTTON_ID = "close-intel-modal-button";

const START_GAME_BUTTON_ID = "start-game-button";
const CLOSE_GAME_BUTTON_ID = "close-game-button";
const GAME_ID = "game";
const ROOT_ID = "root";
const SETUP_GAME_ID = "setup-game";

const STATUS_MESSAGE_ID = "status-message";
const BOARD_AREA_ID = "board-area";
const GAME_BOARD_ID = "game-board";
const LEFT_PLAYER_AREA_ID = "left-player-area";
const TOP_PLAYER_AREA_ID = "top-player-area";
const RIGHT_PLAYER_AREA_ID = "right-player-area";

const ACTION_AREA_ID = "action-area";
const SELECT_VOTE_AREA_ID = "select-vote-area";
const SELECT_GUN_AREA_ID = "select-gun-area";
const SELECT_MISSION_ACTION_CONTAINER_ID = "select-mission-action-container";
const ACTION_RESULTS_AREA_ID = "action-results-area";

const ASSASSINATION_MODAL_ID = "assassination-modal";
const ASSASSINATION_AREA_ID = "assassination-area";
const ASSASSINATION_HEADER_ID = "assassination-header";
const ASSASSINATION_ROLES_SELECT_ID = "assassination-roles-select";
const CONFIRM_ASSASSINATION_BUTTON_ID = "confirm-assassination-button";
const RESET_ASSASSINATION_BUTTON_ID = "reset-assassination-button";

const RESULTS_MODAL_ID = "results-modal";
const CLOSE_RESULTS_MODAL_BUTTON_ID = "close-results-modal-button";
const RESULTS_AREA_ID = "results-area";

const FIVE_PLAYER_BOARD_IMG_SRC = "/images/5-player-board.png";
const SIX_PLAYER_BOARD_IMG_SRC = "/images/6-player-board.png";
const SEVEN_PLAYER_BOARD_IMG_SRC = "/images/7-player-board.png";
const EIGHT_PLAYER_BOARD_IMG_SRC = "/images/8-player-board.png";
const NINE_PLAYER_BOARD_IMG_SRC = "/images/9-player-board.png";
const TEN_PLAYER_BOARD_IMG_SRC = "/images/10-player-board.png";
const DEFAULT_GUN_SLOT_IMG_SRC = "/images/gun.png";
const DEFAULT_GUN_SLOT_IMG_ALT = "gun";
const DEFAULT_VOTE_SLOT_IMG_ALT = "Vote Slot";

const BLANK_VOTE_IMG_SRC = "/images/blank.png";
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
    element.style.display = "none";
    element.disable = true;
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

function createOption(value, text) {
    const optionElement = document.createElement('option');
    optionElement.value = value;
    if (text) {
        optionElement.innerText = text;
    }
    return optionElement;
}

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

function createHeaderTwo(text, styleClasses) {
    const headerTwoElement = document.createElement('h2');
    headerTwoElement.innerText = text;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            headerTwoElement.classList.add(styleClass);
        }
    }
    return headerTwoElement;
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

function removeClickable(element) {
    removeClassFromElement(element, "clickable");
    element.removeAttribute("onclick");
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

    // Get Elements
    const lobbyInformation = document.getElementById(LOBBY_INFORMATION_ID);
    const toggleHostInformationButton = document.getElementById(TOGGLE_HOST_INFORMATION_BUTTON_ID);
    const rolesModal = document.getElementById(ROLES_MODAL_ID);
    const openRolesModalButton = document.getElementById(OPEN_ROLES_MODAL_BUTTON_ID);
    const closeRolesModalButton = document.getElementById(CLOSE_ROLES_MODAL_BUTTON_ID);
    const intelModal = document.getElementById(INTEL_MODAL_ID);
    const intelModalArea = document.getElementById(INTEL_MODAL_AREA_ID);
    const openIntelModalButton = document.getElementById(OPEN_INTEL_MODAL_BUTTON_ID);
    const closeIntelModalButton = document.getElementById(CLOSE_INTEL_MODAL_BUTTON_ID);
    const startGameButton = document.getElementById(START_GAME_BUTTON_ID);
    const closeGameButton = document.getElementById(CLOSE_GAME_BUTTON_ID);
    const game = document.getElementById(GAME_ID);
    const root = document.getElementById(ROOT_ID);

    const statusMessage = document.getElementById(STATUS_MESSAGE_ID);
    const boardArea = document.getElementById(BOARD_AREA_ID);
    const gameBoard = document.getElementById(GAME_BOARD_ID);

    let gamePlayers = [];
    let gunSelected = null;
    let playersSelected = null;
    const leftPlayerArea = document.getElementById(LEFT_PLAYER_AREA_ID);
    const topPlayerArea = document.getElementById(TOP_PLAYER_AREA_ID);
    const rightPlayerArea = document.getElementById(RIGHT_PLAYER_AREA_ID);

    const actionArea = document.getElementById(ACTION_AREA_ID);

    const resultsModal = document.getElementById(RESULTS_MODAL_ID);
    const closeResultsModalButton = document.getElementById(CLOSE_RESULTS_MODAL_BUTTON_ID);
    const assassinationModal = document.getElementById(ASSASSINATION_MODAL_ID);
    const assassinationArea = document.getElementById(ASSASSINATION_AREA_ID);
    const resultsArea = document.getElementById(RESULTS_AREA_ID);

    // Setup Page
    openIntelModalButton.onclick = function() {
        if (intelModal.style.display === "flex") {
            intelModal.style.display = "none";
        } else {
            if (rolesModal.style.display === 'flex') {
                rolesModal.style.display = 'none';
            }
            intelModal.style.display = "flex";
        }
    }
    closeIntelModalButton.onclick = function() {
        intelModal.style.display = "none";
    }
    if (toggleHostInformationButton) {
        toggleHostInformationButton.style.display = "none";
    }
    openIntelModalButton.style.display = "none";
    game.style.display = "none";

    openRolesModalButton.onclick = function() {
        if (rolesModal.style.display === "block") {
            rolesModal.style.display = "none";
        } else {
            if (intelModal.style.display === "flex") {
                intelModal.style.display = "none"
            }
            rolesModal.style.display = "block";
        }
    }

    closeRolesModalButton.onclick = function() {
        rolesModal.style.display = "none";
    }

    closeResultsModalButton.onclick = function() {
        resultsModal.style.display = "none";
    }

    if (startGameButton) {
        startGameButton.onclick = function () {
            socket.emit('start-game');
        };
        closeGameButton.onclick = function () {
            socket.emit('close-lobby');
        };
    }

    if (toggleHostInformationButton) {
        toggleHostInformationButton.onclick = function() {
            if (lobbyInformation.style.display === "none") {
                lobbyInformation.style.display = "flex";
                startGameButton.style.display = "block";
                closeGameButton.style.display = "block";
            } else {
                lobbyInformation.style.display = "none";
                startGameButton.style.display = "none";
                closeGameButton.style.display = "none";
            }
        };
    }

    function updateLobby(players) {
        const activePlayerCount = players.filter(p => p.active).length;
        document.getElementById(LOBBY_PLAYER_COUNT_ID).innerHTML = `Players [${activePlayerCount}]`;
        const lobbyPlayerList = document.getElementById(LOBBY_PLAYER_LIST_ID);

        clearChildrenFromElement(lobbyPlayerList);
        
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerListElement = document.createElement('li');
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
            setButtonDisabled(startGameButton, activePlayerCount < 5, false);
        }
    }

    function handleSetupGame() {
        const setupDiv = createDiv(SETUP_GAME_ID, ["center-flex-column"]);
        const waitingHeader = createHeaderTwo("Waiting for role information...", ["future-header"]);
        setupDiv.appendChild(waitingHeader);
        handleSetupGameDiv(setupDiv);
    }

    function handlePickIdentity(possibleResistanceRoles, possibleSpyRoles) {
        const setupDiv = createDiv(SETUP_GAME_ID, ["center-flex-column"]);

        const identityHeader = createHeaderTwo("Congratulations, you may select your role/team for this game!", ["future-header"]);

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

        setupDiv.appendChild(identityHeader);
        setupDiv.appendChild(identitySelect);
        setupDiv.appendChild(submitIdentitySelectionButton);
        handleSetupGameDiv(setupDiv);
    }

    function handleSetupGameDiv(setupDiv) {
        root.appendChild(setupDiv);

        game.style.display = "none";
        lobbyInformation.style.display = "none";
        if (toggleHostInformationButton) {
            toggleHostInformationButton.style.display = "none";
        }
        if (startGameButton) {
            startGameButton.style.display = "none";
            closeGameButton.style.display = "none";
        }
        openIntelModalButton.style.display = "none";
        intelModal.style.display = "none";
        resultsModal.style.display = "none";
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
        socket.emit('pick-identity', ({identityPickInformation}));
    }

    function handleStartGame(gameHTML, players) {
        gamePlayers = [];
        gunSelected = null;
        playersSelected = null;

        const setupGameDiv = document.getElementById(SETUP_GAME_ID);
        if (setupGameDiv) {
            root.removeChild(setupGameDiv);
        }

        clearChildrenFromElement(leftPlayerArea);
        clearChildrenFromElement(topPlayerArea);
        clearChildrenFromElement(rightPlayerArea);
        lobbyInformation.style.display = "none";
        if (startGameButton) {
            startGameButton.style.display = "none";
            closeGameButton.style.display = "none";
        }
        resultsModal.style.display = "none";
        if (toggleHostInformationButton) {
            toggleHostInformationButton.style.display = "block";
        }
        openIntelModalButton.style.display = "block";
        game.style.display = "flex";
        intelModalArea.innerHTML = gameHTML;

        while (boardArea.children.length > 1) {
            boardArea.removeChild(boardArea.lastChild);
        }

        switch (players.length) {
            case 5:
                gameBoard.src = FIVE_PLAYER_BOARD_IMG_SRC;
                createPlayer(players[0], "Left");
                createPlayer(players[1], "Top");
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Right");
                break;
            case 6:
                gameBoard.src = SIX_PLAYER_BOARD_IMG_SRC;
                createPlayer(players[1], "Left");
                createPlayer(players[0], "Left", true);
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Right");
                createPlayer(players[5], "Right");
                break;
            case 7:
                gameBoard.src = SEVEN_PLAYER_BOARD_IMG_SRC;
                createPlayer(players[1], "Left");
                createPlayer(players[0], "Left", true);
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Right");
                createPlayer(players[6], "Right");
                break;
            case 8:
                gameBoard.src = EIGHT_PLAYER_BOARD_IMG_SRC;
                createPlayer(players[1], "Left");
                createPlayer(players[0], "Left", true);
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Top");
                createPlayer(players[6], "Right");
                createPlayer(players[7], "Right");
                break;
            case 9:
                gameBoard.src = NINE_PLAYER_BOARD_IMG_SRC;
                createPlayer(players[2], "Left");
                createPlayer(players[1], "Left", true);
                createPlayer(players[0], "Left", true);
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Top");
                createPlayer(players[6], "Right");
                createPlayer(players[7], "Right");
                createPlayer(players[8], "Right");
                break;
            case 10:
                gameBoard.src = TEN_PLAYER_BOARD_IMG_SRC;
                createPlayer(players[2], "Left");
                createPlayer(players[1], "Left", true);
                createPlayer(players[0], "Left", true);
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Top");
                createPlayer(players[6], "Top");
                createPlayer(players[7], "Right");
                createPlayer(players[8], "Right");
                createPlayer(players[9], "Right");
                break;
        }

        if (startGameButton) {
            startGameButton.innerHTML = 'Play Again';
            hideElement(startGameButton);
            hideElement(closeGameButton);
        }

        intelModal.style.display = "flex";
    }

    function createPlayer(player, section, unshift) {
        const name = player.name;
        const id = player.id;
        const status = player.status;
        const elementPrefix = `player-${id}`;
        switch (section) {
            case "Left":
                leftPlayerArea.innerHTML += `
                    <div class="horizontal-player">
                        <img class="gun-image" id="${elementPrefix}-gun-slot" src="${DEFAULT_GUN_SLOT_IMG_SRC}" alt="${DEFAULT_GUN_SLOT_IMG_ALT}" style="visibility:hidden"></img>
                        <h2 class="future-header ${status}" id="${elementPrefix}-name">${name}</h2>
                        <img class="vote-image" id="${elementPrefix}-vote-slot" alt="${DEFAULT_VOTE_SLOT_IMG_ALT}" style="visibility:hidden"></img>
                    </div>
                `; 
                break;
            case "Top":
                topPlayerArea.innerHTML += `
                    <div class="vertical-player">
                        <img class="gun-image" id="${elementPrefix}-gun-slot" src="${DEFAULT_GUN_SLOT_IMG_SRC}" alt="${DEFAULT_GUN_SLOT_IMG_ALT}" style="visibility:hidden"></img>
                        <h2 class="future-header ${status}" id="${elementPrefix}-name">${name}</h2>
                        <img class="vote-image" id="${elementPrefix}-vote-slot" alt="${DEFAULT_VOTE_SLOT_IMG_ALT}" style="visibility:hidden"></img>
                    </div>
                `; 
                break;
            case "Right":
                rightPlayerArea.innerHTML += `
                    <div class="horizontal-player">
                        <img class="vote-image" id="${elementPrefix}-vote-slot" alt="${DEFAULT_VOTE_SLOT_IMG_ALT}" style="visibility:hidden"></img>
                        <h2 class="future-header ${status}" id="${elementPrefix}-name">${name}</h2>
                        <img class="gun-image" id="${elementPrefix}-gun-slot" src="${DEFAULT_GUN_SLOT_IMG_SRC}" alt="${DEFAULT_GUN_SLOT_IMG_ALT}" style="visibility:hidden"></img>
                    </div>
                `; 
                break;
        }

        const newPlayer = {
            id: id,
            nameId: `${elementPrefix}-name`,
            gunSlotId: `${elementPrefix}-gun-slot`,
            voteSlotId: `${elementPrefix}-vote-slot`
        };
        if (unshift) {
            gamePlayers.unshift(newPlayer);
        } else {
            gamePlayers.push(newPlayer);
        }
    }

    function updateLeader(previousLeaderId, leaderId) {
        for (let id = 0; id < gamePlayers.length; id++) {
            const player = gamePlayers[id];
            const playerVoteSlot = document.getElementById(player.voteSlotId);
            playerVoteSlot.src = "";
            playerVoteSlot.style.visibility = "hidden";
            playerVoteSlot.alt = DEFAULT_VOTE_SLOT_IMG_ALT;
            const playerGunSlot = document.getElementById(player.gunSlotId);
            playerGunSlot.src = DEFAULT_GUN_SLOT_IMG_SRC;
            playerGunSlot.style.visibility = "hidden";
            playerGunSlot.alt = DEFAULT_GUN_SLOT_IMG_ALT;

            if (id === previousLeaderId) {
                removeClassFromElement(document.getElementById(player.nameId), "current-leader");
            } else if (id === leaderId) {
                addClassToElement(document.getElementById(player.nameId), "current-leader");
            }
        }

        clearChildrenFromElement(actionArea);
        gunSelected = null;
    }

    function showButton(text, handleClick) {
        const button = createButton(text, ["future-button"]);
        button.onclick = handleClick;
        actionArea.appendChild(button);
    }

    function showConfirmProposal() {
        if (actionArea.getElementsByTagName("button").length === 0) {
            showButton("Confirm", function () {
                clearChildrenFromElement(actionArea);
                submitProposal();
            });
        }
    }

    function showAdvance() {
        if (actionArea.getElementsByTagName("button").length === 0) {
            showButton("Advance", function () {
                clearChildrenFromElement(actionArea);
                socket.emit('advance-mission');
            });
        }
    }

    function setupProposal(gunSlots) {
        clearChildrenFromElement(actionArea);

        // Set click events for guns already attached to players
        for (let i = 0; i < gamePlayers.length; i++) {
            const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
            if (gunSlot.style.visibility === "visible") {
                gunSlot.classList.add("clickable");
                gunSlot.onclick = function () {
                    updateGunSelected(gunSlot);
                    attachNameClicks();
                };
            }
        }

        if (gunSlots.length) {
            const gunArea = createDiv(SELECT_GUN_AREA_ID);
            actionArea.appendChild(gunArea);
            for (let i = 0; i < gunSlots.length; i++) {
                const gunSlot = gunSlots[i];
                const gunImage = createImage(null, `/images/${gunSlot}.png`, gunSlot, ["gun-image", "clickable"]);
                gunImage.onclick = function () {
                    updateGunSelected(gunImage);
                    attachNameClicks();
                };
                gunArea.appendChild(gunImage);
            }
        } else {
            showConfirmProposal();
        }
    }

    function updateGunSelected(gunClicked) {
        if (gunSelected) {
            removeClassFromElement(gunSelected, "selected-image");
        }
        gunSelected = gunClicked;
        if (gunSelected) {
            addClassToElement(gunSelected, "selected-image");
        }
    }

    function attachNameClicks() {
        for (let i = 0; i < gamePlayers.length; i++) {
            const playerName = document.getElementById(gamePlayers[i].nameId);
            playerName.classList.add("clickable");
            playerName.onclick = function () {
                handleNameClick(i);
                updateGunSelected(null);
                removeNameClicks();

                socket.emit('update-team', {gunSlots: getGunSlots()});
                const selectGunArea = document.getElementById(SELECT_GUN_AREA_ID);
                if (selectGunArea && selectGunArea.childElementCount === 0) {
                    showConfirmProposal();
                }
            };
        }
    }

    function handleNameClick(i) {
        const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
        if (gunSlot.alt !== gunSelected.alt) {
            if (gunSlot.alt === DEFAULT_GUN_SLOT_IMG_ALT) {
                gunSlot.style.visibility = "visible";
                gunSlot.src = `/images/${gunSelected.alt}.png`;
                gunSlot.alt = gunSelected.alt;
                gunSlot.classList.add("clickable");
                gunSlot.onclick = function () {
                    updateGunSelected(gunSlot);
                    attachNameClicks();
                };
    
                if (gunSelected.parentNode.id === SELECT_GUN_AREA_ID) {
                    gunSelected.remove();
                } else {
                    gunSelected.src = DEFAULT_GUN_SLOT_IMG_SRC;
                    gunSelected.alt = DEFAULT_GUN_SLOT_IMG_ALT;
                    gunSelected.classList.remove("selected-image");
                    removeClickable(gunSelected);
                    gunSelected.style.visibility = "hidden";
                }
            } else {
                const tempSrc = gunSlot.src;
                const tempAlt = gunSlot.alt;
                gunSlot.src = gunSelected.src;
                gunSlot.alt = gunSelected.alt;
                gunSelected.src = tempSrc;
                gunSelected.alt = tempAlt;
            }
        }
    }

    function removeNameClicks() {
        for (let i = 0; i < gamePlayers.length; i++) {
            const playerName = document.getElementById(gamePlayers[i].nameId);
            removeClickable(playerName);
        }
    }

    function getGunSlots() {
        const gunSlots = [];
        for (let i = 0; i < gamePlayers.length; i++) {
            const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
            if (gunSlot.style.visibility === "visible") {
                gunSlots.push(gunSlot.alt);
            } else {
                gunSlots.push("");
            }
        }
        return gunSlots;
    }

    function updateGunSlots(gunSlots) {
        if (gunSlots) {
            for (let i = 0; i < gamePlayers.length; i++) {
                const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
                gunSlot.style.visibility = "visible";
                if (gunSlots[i]) {
                    gunSlot.src = `/images/${gunSlots[i]}.png`;
                    gunSlot.alt = gunSlots[i];
                } else {
                    gunSlot.src = DEFAULT_GUN_SLOT_IMG_SRC;
                    gunSlot.alt = DEFAULT_GUN_SLOT_IMG_ALT;
                    gunSlot.style.visibility = "hidden";
                }
            }
        }
    }

    function submitProposal() {
        const selectedIds = [];
        for (let i = 0; i < gamePlayers.length; i++) {
            const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
            if (gunSlot.style.visibility === "visible") {
                selectedIds.push(i);
                removeClickable(gunSlot);
            }

            const playerName = document.getElementById(gamePlayers[i].nameId);
            removeClickable(playerName);
        }

        updateGunSelected(null);

        socket.emit('propose-team', {selectedIds});
    }

    function setupVote(selectedVote) {
        statusMessage.innerHTML = "Voting on team...";

        const selectVoteArea = createDiv(SELECT_VOTE_AREA_ID);
        actionArea.appendChild(selectVoteArea);

        const approveTeamImage = createImage(null, APPROVE_VOTE_IMG_SRC, APPROVE_VOTE_IMG_ALT, ['vote-image', 'clickable']);
        approveTeamImage.onclick = function() {
            handleProposalVoteSelection(selectVoteArea.children, approveTeamImage, true);
        }
        selectVoteArea.appendChild(approveTeamImage);

        const rejectTeamImage = createImage(null, REJECT_VOTE_IMG_SRC, REJECT_VOTE_IMG_ALT, ['vote-image', 'clickable']);
        rejectTeamImage.onclick = function() {
            handleProposalVoteSelection(selectVoteArea.children, rejectTeamImage, false);
        }
        selectVoteArea.appendChild(rejectTeamImage);

        if (selectedVote === true) {
            approveTeamImage.classList.add("selected-image");
        } else if (selectedVote == false) {
            rejectTeamImage.classList.add("selected-image");
        }
    }

    function handleProposalVoteSelection(voteOptions, selectedOption, selectedVote) {
        for (let option of voteOptions) {
            if (option.alt === selectedOption.alt) {
                addClassToElement(option, "selected-image");
            } else {
                removeClassFromElement(option, "selected-image");
            }
        }
        socket.emit('vote-team', {vote: selectedVote});
    }

    function showPlayerVoted(id) {
        const voteSlot = document.getElementById(gamePlayers[id].voteSlotId);
        voteSlot.style.visibility = "visible";
        voteSlot.src = BLANK_VOTE_IMG_SRC;
    }

    function showVoteResult(votes, approved) {
        actionArea.innerHTML= "";

        if (approved) {
            statusMessage.innerHTML = "Proposal Approved!";
        } else {
            statusMessage.innerHTML = "Proposal Rejected!";
        }

        for (let i = 0; i < gamePlayers.length; i++) {
            const voteSlot = document.getElementById(gamePlayers[i].voteSlotId);
            voteSlot.style.visibility = "visible";
            if (votes[i]) {
                voteSlot.src = APPROVE_VOTE_IMG_SRC;
            } else {
                voteSlot.src = REJECT_VOTE_IMG_SRC;
            }
        }
    }

    function setupMission(failAllowed, reverseAllowed) {
        const selectMissionActionContainer = createDiv(SELECT_MISSION_ACTION_CONTAINER_ID);
        actionArea.appendChild(selectMissionActionContainer);

        const successMissionActionImage = createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ['action-image', 'clickable']);
        successMissionActionImage.onclick = function () {
            handleMissionActionSelection(selectMissionActionContainer.children, successMissionActionImage, 'Succeed');
        };
        selectMissionActionContainer.appendChild(successMissionActionImage);

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
        const actionAreaButtons = actionArea.getElementsByTagName("button");
        if (actionAreaButtons.length === 0) {
            showButton("Confirm", function () {
                socket.emit('conduct-mission', {action: action});
                clearChildrenFromElement(actionArea);
            });
        } else {
            actionAreaButtons[0].onclick = function () {
                socket.emit('conduct-mission', {action: action});
                clearChildrenFromElement(actionArea);
            };
        }
    }

    function showMissionResult(result, showActions) {
        if (showActions) {
            clearChildrenFromElement(actionArea);
            const actionResultArea = createDiv(ACTION_RESULTS_AREA_ID);
            actionArea.appendChild(actionResultArea);
            for (let i = 0; i < result.successCount; i++) {
                actionResultArea.appendChild(createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ["action-image"]));
            }
            for (let i = 0; i < result.failCount; i++) {
                actionResultArea.appendChild(createImage(null, FAIL_MISSION_IMG_SRC, FAIL_MISSION_IMG_ALT, ["action-image"]));
            }
            for (let i = 0; i < result.reverseCount; i++) {
                actionResultArea.appendChild(createImage(null, REVERSE_MISSION_IMG_SRC, REVERSE_MISSION_IMG_ALT, ["action-image"]));
            }
        }

        const missionId = boardArea.children.length - 1;
        const resultImage = document.createElement('img');
        resultImage.classList.add("result-image");
        if (result.result === "Success") {
            statusMessage.innerHTML = "Mission successful!";
            resultImage.src = SUCCESSFUL_MISSION_IMG_SRC;
            resultImage.alt = SUCCESSFUL_MISSION_IMG_ALT;
        } else {
            statusMessage.innerHTML = "Mission failed!";
            resultImage.src = FAILED_MISSION_IMG_SRC;
            resultImage.alt = FAILED_MISSION_IMG_ALT;
        }
        switch (missionId) {
            case 0:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "1.5vw";
                        resultImage.style.top = "17.5vh";
                        break;
                    case 6:
                        resultImage.style.left = "2.75vw";
                        resultImage.style.top = "16.5vh";
                        break;
                    case 7:
                        resultImage.style.left = "2vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "1.75vw";
                        resultImage.style.top = "17.75vh";
                        break;
                    case 9:
                        resultImage.style.left = "1.65vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "1.65vw";
                        resultImage.style.top = "17vh";
                        break;
                }
                break;
            case 1:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "9.5vw";
                        resultImage.style.top = "17.5vh";
                        break;
                    case 6:
                        resultImage.style.left = "9.75vw";
                        resultImage.style.top = "16.5vh";
                        break;
                    case 7:
                        resultImage.style.left = "9.4vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "9.25vw";
                        resultImage.style.top = "17.75vh";
                        break;
                    case 9:
                        resultImage.style.left = "9.45vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "9.45vw";
                        resultImage.style.top = "16.8vh";
                        break;
                }
                break;
            case 2:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "17.25vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 6:
                        resultImage.style.left = "16.6vw";
                        resultImage.style.top = "16.5vh";
                        break;
                    case 7:
                        resultImage.style.left = "16.65vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "16.35vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "17vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "17vw";
                        resultImage.style.top = "16.8vh";
                        break;
                }
                break;
            case 3:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "24.9vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 6:
                        resultImage.style.left = "23.45vw";
                        resultImage.style.top = "16.4vh";
                        break;
                    case 7:
                        resultImage.style.left = "23.75vw";
                        resultImage.style.top = "17.5vh";
                        break;
                    case 8:
                        resultImage.style.left = "23.6vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "24.6vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "24.65vw";
                        resultImage.style.top = "16.75vh";
                        break;
                }
                break;
            case 4:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "32.75vw";
                        resultImage.style.top = "17vh";
                        break;
                    case 6:
                        resultImage.style.left = "30.35vw";
                        resultImage.style.top = "16.4vh";
                        break;
                    case 7:
                        resultImage.style.left = "31.1vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "30.8vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "32.25vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "32.35vw";
                        resultImage.style.top = "16.75vh";
                        break;
                }
                break;
        }
        boardArea.appendChild(resultImage);
    }

    function setupAssassination() {
        playersSelected = [];
        assassinationModal.style.display = "flex";
        assassinationArea.innerHTML = `
            <h3 class="future-header" id="${ASSASSINATION_HEADER_ID}">Select Player(s) To Assassinate</h3>
            <select id="${ASSASSINATION_ROLES_SELECT_ID}">
                <option value=""></option>
                <option value="Merlin">Merlin</option>
                <option value="Arthur">Arthur</option>
                <option value="Lovers">Lovers</option>
            </select>
            <button class="future-button" type="button"
                id="${RESET_ASSASSINATION_BUTTON_ID}">Reset Assassination</button>
            <button class="future-button future-button-disabled" type="button"
                id="${CONFIRM_ASSASSINATION_BUTTON_ID}" disabled>Confirm Assassination</button>
        `;

        for (let i = 0; i < gamePlayers.length; i++) {
            const nameElement = document.getElementById(gamePlayers[i].nameId);
            if (nameElement.classList.contains("resistance")) {
                nameElement.classList.add("clickable");
                nameElement.onclick = function () {
                    handleAssassinationClick(i);
                };
            }
        }

        document.getElementById(RESET_ASSASSINATION_BUTTON_ID).onclick = function () {
            playersSelected = [];
            document.getElementById(ASSASSINATION_HEADER_ID).innerHTML = "Select Player(s) To Assassinate";
            document.getElementById(ASSASSINATION_ROLES_SELECT_ID).innerHTML = `
                <option value=""></option>
                <option value="Merlin">Merlin</option>
                <option value="Arthur">Arthur</option>
                <option value="Lovers">Lovers</option>
            `;
            setButtonDisabled(document.getElementById(CONFIRM_ASSASSINATION_BUTTON_ID), true);
        };
    }

    function handleAssassinationClick(id) {
        const index = playersSelected.indexOf(id);
        if (index !== -1) {
            playersSelected.splice(index, 1);
        } else {
            playersSelected.push(id);
        }

        const confirmAssassinationButton = document.getElementById(CONFIRM_ASSASSINATION_BUTTON_ID);
        const assassinationHeader = document.getElementById(ASSASSINATION_HEADER_ID);

        if (playersSelected.length === 0) {
            assassinationHeader.innerHTML = "Select Player(s) To Assassinate";
            setButtonDisabled(document.getElementById(CONFIRM_ASSASSINATION_BUTTON_ID), true);
        } else if (playersSelected.length > 2) {
            assassinationHeader.innerHTML = "Too Many Players Selected! Please Reset";
            setButtonDisabled(document.getElementById(CONFIRM_ASSASSINATION_BUTTON_ID), true);
        } else {
            assassinationHeader.innerHTML = `
                Assassinate ${playersSelected.map(i => document.getElementById(gamePlayers[i].nameId).innerHTML).join(' and ')} as:
            `;

            const assassinationRolesSelect = document.getElementById(ASSASSINATION_ROLES_SELECT_ID);
            assassinationRolesSelect.onchange = function() {
                if (assassinationRolesSelect.value && correctPlayersSelected(assassinationRolesSelect.value)) {
                    confirmAssassinationButton.disabled = false;
                    confirmAssassinationButton.classList.remove("future-button-disabled");
                    confirmAssassinationButton.onclick = function () {
                        socket.emit('conduct-assassination', {ids: playersSelected, role: assassinationRolesSelect.value});
                        assassinationModal.style.display = "none";
                    };
                } else {
                    setButtonDisabled(document.getElementById(CONFIRM_ASSASSINATION_BUTTON_ID), true);
                }
            }
            
            if (playersSelected.length === 2) {
                assassinationRolesSelect.innerHTML = `
                    <option value=""></option>
                    <option value="Lovers">Lovers</option>
                `;
            } else {
                assassinationRolesSelect.innerHTML = `
                    <option value=""></option>
                    <option value="Merlin">Merlin</option>
                    <option value="Arthur">Arthur</option>
                `;
            }
            setButtonDisabled(document.getElementById(CONFIRM_ASSASSINATION_BUTTON_ID), true);
        }
    }

    function correctPlayersSelected(option) {
        switch (option) {
            case "Lovers":
                return playersSelected.length === 2;
            case "Merlin":
            case "Arthur":
                return playersSelected.length === 1;
            default:
                return playersSelected.length === 1 || playersSelected.length === 2;
        }
    }

    function showGameResult(winner, message) {
        resultsModal.style.display = "flex";
        rolesModal.style.display = "none";
        intelModal.style.display = "none";
        resultsArea.innerHTML = message;
        statusMessage.innerHTML = `${winner} wins!`;
        if (startGameButton) {
            startGameButton.style.display = "block";
            closeGameButton.style.display = "block";
        }
    }

    // Attach Socket functions
    socket.on('update-players', ({currentPlayers}) => {
        updateLobby(currentPlayers);
    });

    socket.on('setup-game', () => {
        handleSetupGame();
    });

    socket.on('pick-identity', ({possibleResistanceRoles, possibleSpyRoles}) => {
        handlePickIdentity(possibleResistanceRoles, possibleSpyRoles);
    });
    
    socket.on('start-game', ({gameHTML, players}) => {
        handleStartGame(gameHTML, players);
    });

    socket.on('close-lobby', () => {
        location.replace(`${ROOT_URL}?menu=join`);
    });

    socket.on('update-leader', ({previousLeaderId, leaderId}) => {
        updateLeader(previousLeaderId, leaderId);
    });

    socket.on('update-status', ({message}) => {
        statusMessage.innerHTML = message;
    });

    socket.on('react', () => {
        showAdvance();
    });
    
    socket.on('propose-team', ({gunSlots}) => {
        setupProposal(gunSlots);
    });

    socket.on('update-team', ({gunSlots}) => {
        updateGunSlots(gunSlots);
    });

    socket.on('vote-team', ({selectedVote}) => {
        setupVote(selectedVote);
    });

    socket.on('player-vote', ({id}) => {
        showPlayerVoted(id);
    });

    socket.on('vote-result', ({votes, approved}) => {
        showVoteResult(votes, approved);
    });

    socket.on('conduct-mission', ({failAllowed, reverseAllowed}) => {
        setupMission(failAllowed, reverseAllowed);
    });

    socket.on('mission-result', ({result, showActions}) => {
        showMissionResult(result, showActions);  
    });

    socket.on('conduct-assassination', () => {
        setupAssassination();
    });

    socket.on('game-result', ({winner, message}) => {
        showGameResult(winner, message);
    });
});
