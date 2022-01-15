import {
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
    createHeaderTwo,
    createLabel,
    createOption,
    createSelect,
    addClassToElement,
    removeClassFromElement,
    hideElement,
    clearChildrenFromElement,
    setButtonDisabled,
    clearGameContent,
    createLobbyPlayerList,
    showConductRedemption,
    showConductAssassination,
    showGameResult
} from './game.js';

function createMissionResultSelect(id, enableNoneOption) {
    const missionResultSelect = createSelect(id, enableNoneOption);
    missionResultSelect.appendChild(createOption("Resistance", "Resistance"));
    missionResultSelect.appendChild(createOption("Spies", "Spies"));
    return missionResultSelect;
}

// Socket Handlers
socket.on('lobby:update-players', (currentPlayers) => {
    const activePlayerCount = currentPlayers.filter(p => p.active).length;
    document.getElementById(LOBBY_PLAYER_COUNT_ID).innerHTML = `Players [${activePlayerCount}]`;

    const lobbyPlayerList = createLobbyPlayerList(currentPlayers);

    if (amHost) {
        setButtonDisabled(startGameButton, activePlayerCount < 5, false);
    }

    lobbyPlayers.appendChild(lobbyPlayerList);
});

socket.on('role:assign', (roleHTML) => {
    startGame(roleHTML);
});

socket.on('game:setup', (firstLeaderName) => {
    setupFinishGame(firstLeaderName);
});

socket.on('redemption:conduct', (conductRedemptionInformation) => {
    handleConductRedemption(conductRedemptionInformation);
});

socket.on('assassination:conduct', (conductAssassinationInformation) => {
    handleConductAssassination(conductAssassinationInformation);
});

socket.on('game:result', (gameResultInformation) => {
    showGameResult(gameResultInformation);
});

// Socket Functions

function startGame(roleHTML) {
    hideElement(menuModal);
    hideElement(lobbyContent);
    hideElement(helpContent);
    hideElement(gameContent);
    clearGameContent(true);
    roleContent.innerHTML = roleHTML;
    roleContent.style.display = "flex";
    viewRoleButton.style.display = "block";
    viewLobbyButton.innerText = "View Lobby";

    if (amHost) {
        backButton.style.display = "flex";
        backButton.title = "Return To Game";
        startGameButton.innerHTML = 'New Game';
        viewGameButton.style.display = "block";
    } else {
        hideElement(viewGameButton);
        backButton.title = "Return To Role";
    }
}

function setupFinishGame(firstLeaderName) {
    clearGameContent(true);

    const firstLeaderHeader = createHeaderTwo(null, `First Leader: ${firstLeaderName}`);

    const missionOneDiv = createDiv(null, ["center-flex-row"]);
    const missionOneLabel = createLabel("mission-one-result-select", "Mission 1 Winner:");
    const missionOneSelect = createMissionResultSelect("mission-one-result-select", false);
    missionOneDiv.appendChild(missionOneLabel);
    missionOneDiv.appendChild(missionOneSelect);

    const missionTwoDiv = createDiv(null, ["center-flex-row"]);
    const missionTwoLabel = createLabel("mission-two-result-select", "Mission 2 Winner:");
    const missionTwoSelect = createMissionResultSelect("mission-two-result-select", false);
    missionTwoDiv.appendChild(missionTwoLabel);
    missionTwoDiv.appendChild(missionTwoSelect);

    const missionThreeDiv = createDiv(null, ["center-flex-row"]);
    const missionThreeLabel = createLabel("mission-three-result-select", "Mission 3 Winner:");
    const missionThreeSelect = createMissionResultSelect("mission-three-result-select", false);
    missionThreeDiv.appendChild(missionThreeLabel);
    missionThreeDiv.appendChild(missionThreeSelect);

    const missionFourDiv = createDiv(null, ["center-flex-row"]);
    const missionFourLabel = createLabel("mission-four-result-select", "Mission 4 Winner:");
    const missionFourSelect = createMissionResultSelect("mission-four-result-select", true);
    missionFourDiv.appendChild(missionFourLabel);
    missionFourDiv.appendChild(missionFourSelect);

    const missionFiveDiv = createDiv(null, ["center-flex-row"]);
    const missionFiveLabel = createLabel("mission-five-result-select", "Mission 5 Winner:");
    const missionFiveSelect = createMissionResultSelect("mission-five-result-select", true);
    missionFiveDiv.appendChild(missionFiveLabel);
    missionFiveDiv.appendChild(missionFiveSelect);

    const submitMissionResultsButton = createButton("Submit");

    let currentMissionResults = [null, null, null, null, null];

    function handleMissionResultChange(mission, result) {
        currentMissionResults[mission] = result;
        if (getMissionsWinner() !== null) {
            submitMissionResultsButton.onclick = function () {
                socket.emit('mission:results', currentMissionResults);
            };
            setButtonDisabled(submitMissionResultsButton, false);
        } else {
            submitMissionResultsButton.removeAttribute("onclick");
            setButtonDisabled(submitMissionResultsButton, true);
        }
    }

    function getMissionsWinner() {
        let resistanceWins = 0;
        let spyWins = 0;
        for (let missionWinner of currentMissionResults) {
            if (missionWinner === "Resistance") {
                if (resistanceWins === 3 || spyWins === 3) {
                    return null;
                } else {
                    resistanceWins += 1;
                }
            } else if (missionWinner === "Spies") {
                if (resistanceWins === 3 || spyWins === 3) {
                    return null;
                } else {
                    spyWins += 1;
                }
            } else if (resistanceWins !== 3 && spyWins !== 3) {
                return null;
            }
        }
        return resistanceWins === 3 ? "Resistance" : "Spies";
    }

    missionOneSelect.onchange = function () {
        handleMissionResultChange(0, missionOneSelect.value);
    };
    missionTwoSelect.onchange = function () {
        handleMissionResultChange(1, missionTwoSelect.value);
    };
    missionThreeSelect.onchange = function () {
        handleMissionResultChange(2, missionThreeSelect.value);
    };
    missionFourSelect.onchange = function () {
        handleMissionResultChange(3, missionFourSelect.value);
    };
    missionFiveSelect.onchange = function () {
        handleMissionResultChange(4, missionFiveSelect.value);
    };
    
    gameContent.appendChild(firstLeaderHeader);
    gameContent.appendChild(missionOneDiv);
    gameContent.appendChild(missionTwoDiv);
    gameContent.appendChild(missionThreeDiv);
    gameContent.appendChild(missionFourDiv);
    gameContent.appendChild(missionFiveDiv);
    gameContent.appendChild(submitMissionResultsButton);

    setButtonDisabled(submitMissionResultsButton, true);
}

function handleConductRedemption(conductRedemptionInformation) {
    clearGameContent(true);
    showConductRedemption(conductRedemptionInformation);
}

function handleConductAssassination(conductAssassinationInformation) {
    clearGameContent(true);
    showConductAssassination(conductAssassinationInformation);
}
