//const ROOT_URL = "https://extavalon.com";
const ROOT_URL = "http://localhost:25565";
//const ROOT_URL = "http://192.168.1.107:25565";

const ROOT_ID = "root";
const LOBBY_ID = "lobby";
const LOBBY_INFORMATION_ID = "lobby-information";
const TOGGLE_LOBBY_BUTTON_ID = "toggle-lobby-button";
const LOBBY_PLAYER_COUNT_ID = "lobby-player-count";
const LOBBY_PLAYER_LIST_ID = "lobby-player-list";
const PLAYER_NAME_ID = "name";
const ROLES_MODAL_ID = "roles-modal";
const OPEN_ROLES_MODAL_BUTTON_ID = "open-roles-modal-button";
const CLOSE_ROLES_MODAL_BUTTON_ID = "close-roles-modal-button";
const START_GAME_BUTTON_ID = "start-game-button";
const FINISH_GAME_BUTTON_ID = "finish-game-button";
const CLOSE_LOBBY_BUTTON_ID = "close-lobby-button";
const GAME_INFORMATION_ID = "game-information";
const HOST_INFORMATION_ID = "host-information";
const SUBMIT_RESULTS_MODAL_ID = "submit-results-modal";

function parseCookie(str) {
    return str.split(';').map(v => v.split('=')).reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
};

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
    const toggleLobbyButton = document.getElementById(TOGGLE_LOBBY_BUTTON_ID);
    const playerName = document.getElementById(PLAYER_NAME_ID);
    const rolesModal = document.getElementById(ROLES_MODAL_ID);
    const openRolesModalButton = document.getElementById(OPEN_ROLES_MODAL_BUTTON_ID);
    const closeRolesModalButton = document.getElementById(CLOSE_ROLES_MODAL_BUTTON_ID);
    const startGameButton = document.getElementById(START_GAME_BUTTON_ID);
    const finishGameButton = document.getElementById(FINISH_GAME_BUTTON_ID);
    const closeLobbyButton = document.getElementById(CLOSE_LOBBY_BUTTON_ID);
    const gameInformation = document.getElementById(GAME_INFORMATION_ID);
    const hostInformation = document.getElementById(HOST_INFORMATION_ID);

    // Setup Page
    toggleLobbyButton.onclick = function() {
        if (lobbyInformation.style.display === "none") {
            lobbyInformation.style.display = "block";
        } else {
            lobbyInformation.style.display = "none";
        }
    }

    openRolesModalButton.onclick = function() {
        lobby.style.display = "none";
        openRolesModalButton.style.display = "none";
        toggleLobbyButton.style.display = "none";
        rolesModal.style.display = "block";
    }

    closeRolesModalButton.onclick = function() {
        rolesModal.style.display = "none";
        lobby.style.display = "flex";
        openRolesModalButton.style.display = "block";
        toggleLobbyButton.style.display = "block";
    }

    if (startGameButton) {
        startGameButton.onclick = function () {
            socket.emit('start-game-local');
        };
        finishGameButton.style.display = "none";
        closeLobbyButton.onclick = function () {
            socket.emit('close-lobby');
        };
    } else {
        lobbyInformation.style.display = "none";
    }

    // Socket Handlers
    socket.on('update-players', ({displayName, currentPlayers}) => {
        playerName.innerText = displayName;
        updateLobby(currentPlayers);
    });
    
    socket.on('start-game', ({gameHTML, amFirstPlayer}) => {
        startGame(gameHTML, amFirstPlayer);
    });

    socket.on('setup-finish-game-local', ({assassinatablePlayers}) => {
        setupFinishGame(assassinatablePlayers);
    });

    socket.on('finish-game-local', ({resistancePlayers, spyPlayers}) => {
        showTeams(resistancePlayers, spyPlayers);
    });

    socket.on('close-lobby', () => {
        location.replace(`${ROOT_URL}?menu=join`);
    });

    // Socket Functions
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
            setButtonDisabled(startGameButton, activePlayerCount < 5);
        }
    }

    function startGame(gameHTML, amFirstPlayer) {
        lobbyInformation.style.display = "none";

        if (amFirstPlayer) {
            addClassToElement(playerName, "first-player");
        } else {
            removeClassFromElement(playerName, "first-player");
        }

        gameInformation.innerHTML = gameHTML;

        addClassToElement(gameInformation, "active");

        if (startGameButton) {
            let submitResultsModal = null;
            for (var i = 0; i < root.children.length; i++) {
                const child = root.children[i];
                if (child.id === SUBMIT_RESULTS_MODAL_ID) {
                    submitResultsModal = child;
                }
            }

            if (submitResultsModal) {
                root.removeChild(submitResultsModal);
            }

            startGameButton.innerHTML = 'New Game';
            finishGameButton.style.display = "block";
            setButtonDisabled(finishGameButton, false);
            finishGameButton.onclick = function () {
                socket.emit('setup-finish-game-local');
            };
        }
    }

    function setupFinishGame(assassinatablePlayers) {
        const submitResultsDiv = createDiv(SUBMIT_RESULTS_MODAL_ID, ["online-modal"]);
        const missionOneLabel = createLabel("mission-one-result-select", "Mission 1 Winner:");
        const missionTwoLabel = createLabel("mission-two-result-select", "Mission 2 Winner:");
        const missionThreeLabel = createLabel("mission-three-result-select", "Mission 3 Winner:");
        const missionFourLabel = createLabel("mission-four-result-select", "Mission 4 Winner:");
        const missionFiveLabel = createLabel("mission-five-result-select", "Mission 5 Winner:");
        const missionOneSelect = createMissionResultSelect("mission-one-result-select", false);
        const missionTwoSelect = createMissionResultSelect("mission-two-result-select", false);
        const missionThreeSelect = createMissionResultSelect("mission-three-result-select", false);
        const missionFourSelect = createMissionResultSelect("mission-four-result-select", true);
        const missionFiveSelect = createMissionResultSelect("mission-five-result-select", true);
        const assassinationRoleLabel = createLabel("assassination-role-select", "Role:");
        const assassinationRoleSelect = createSelect("assassination-role-select", false);
        assassinationRoleSelect.appendChild(createOption("merlin", "Merlin"));
        assassinationRoleSelect.appendChild(createOption("arthur", "Arthur"));
        assassinationRoleSelect.appendChild(createOption("lovers", "Tristan & Iseult"));
        const assassinationFirstPlayerLabel = createLabel("assassination-first-player-select", "Player:");
        const assassinationSecondPlayerLabel = createLabel("assassination-second-player-select", "Player:");
        const assassinationFirstPlayerSelect = createSelect("assassination-first-player-select", false);
        const assassinationSecondPlayerSelect = createSelect("assassination-second-player-select", false);
        for (let player of assassinatablePlayers) {
            assassinationFirstPlayerSelect.appendChild(createOption(player.id, player.name));
            assassinationSecondPlayerSelect.appendChild(createOption(player.id, player.name));
        }

        let currentGameResult = {
            missions: [null, null, null, null, null],
            assassination: null
        };

        function handleMissionResultChange(mission, result) {
            currentGameResult.missions[mission] = result;
            const missionsWinner = getMissionsWinner();
            if (missionsWinner === "spies") {
                assassinationRoleLabel.style.visibility = "hidden";
                hideSelect(assassinationRoleSelect);
                assassinationFirstPlayerLabel.style.visibility = "hidden";
                hideSelect(assassinationFirstPlayerSelect);
                assassinationSecondPlayerLabel.style.visibility = "hidden";
                hideSelect(assassinationSecondPlayerSelect);
                finishGameButton.onclick = function () {
                    socket.emit('finish-game-local', {gameResult: currentGameResult});
                };
                setButtonDisabled(finishGameButton, false);
            } else if (missionsWinner === "resistance") {
                assassinationRoleLabel.style.visibility = "visible";
                reshowSelect(assassinationRoleSelect);
                assassinationFirstPlayerLabel.style.visibility = "hidden";
                hideSelect(assassinationFirstPlayerSelect);
                assassinationSecondPlayerLabel.style.visibility = "hidden";
                hideSelect(assassinationSecondPlayerSelect);
            } else {
                assassinationRoleLabel.style.visibility = "hidden";
                hideSelect(assassinationRoleSelect);
                assassinationFirstPlayerLabel.style.visibility = "hidden";
                hideSelect(assassinationFirstPlayerSelect);
                assassinationSecondPlayerLabel.style.visibility = "hidden";
                hideSelect(assassinationSecondPlayerSelect);
                finishGameButton.removeAttribute("onclick");
                setButtonDisabled(finishGameButton, true);
            }
        }

        function getMissionsWinner() {
            let resistanceWins = 0;
            let spyWins = 0;
            for (let missionWinner of currentGameResult.missions) {
                if (missionWinner === "resistance") {
                    if (resistanceWins === 3 || spyWins === 3) {
                        return null;
                    } else {
                        resistanceWins += 1;
                    }
                } else if (missionWinner === "spies") {
                    if (resistanceWins === 3 || spyWins === 3) {
                        return null;
                    } else {
                        spyWins += 1;
                    }
                } else if (resistanceWins !== 3 && spyWins !== 3) {
                    return null;
                }
            }
            return resistanceWins === 3 ? "resistance" : "spies";
        }

        function handleAssassinationRoleChange() {
            switch (assassinationRoleSelect.selectedIndex) {
                case 0:
                    assassinationFirstPlayerLabel.style.visibility = "hidden";
                    hideSelect(assassinationFirstPlayerSelect);
                    assassinationSecondPlayerLabel.style.visibility = "hidden";
                    hideSelect(assassinationSecondPlayerSelect);
                    break;
                case 3:
                    assassinationFirstPlayerLabel.style.visibility = "visible";
                    reshowSelect(assassinationFirstPlayerSelect);
                    assassinationSecondPlayerLabel.style.visibility = "visible";
                    reshowSelect(assassinationSecondPlayerSelect);
                    break;
                default:
                    assassinationFirstPlayerLabel.style.visibility = "visible";
                    reshowSelect(assassinationFirstPlayerSelect);
                    assassinationSecondPlayerLabel.style.visibility = "hidden";
                    hideSelect(assassinationSecondPlayerSelect);
                    break;
            }
            finishGameButton.removeAttribute("onclick");
            setButtonDisabled(finishGameButton, true);
        }

        function handleAssassinationPlayerChange() {
            if (assassinationRoleSelect.value === "lovers") {
                if (assassinationFirstPlayerSelect.selectedIndex !== 0 && assassinationSecondPlayerSelect.selectedIndex !== 0) {
                    currentGameResult.assassination = {
                        role: "lovers",
                        players: [assassinationFirstPlayerSelect.value, assassinationSecondPlayerSelect.value]
                    };
                    finishGameButton.onclick = function () {
                        socket.emit('finish-game-local', {gameResult: currentGameResult});
                    };
                    setButtonDisabled(finishGameButton, false);
                } else {
                    currentGameResult.assassination = null;
                    finishGameButton.removeAttribute("onclick");
                    setButtonDisabled(finishGameButton, true);
                }
            } else {
                if (assassinationFirstPlayerSelect.selectedIndex !== 0) {
                    currentGameResult.assassination = {
                        role: assassinationRoleSelect.value,
                        players: [assassinationFirstPlayerSelect.value]
                    };
                    finishGameButton.onclick = function () {
                        socket.emit('finish-game-local', {gameResult: currentGameResult});
                    };
                    setButtonDisabled(finishGameButton, false);
                } else {
                    currentGameResult.assassination = null;
                    finishGameButton.removeAttribute("onclick");
                    setButtonDisabled(finishGameButton, true);
                }
            }
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
        assassinationRoleSelect.onchange = handleAssassinationRoleChange;
        assassinationFirstPlayerSelect.onchange = handleAssassinationPlayerChange;
        assassinationSecondPlayerSelect.onchange = handleAssassinationPlayerChange;

        submitResultsDiv.appendChild(missionOneLabel);
        submitResultsDiv.appendChild(missionOneSelect);
        submitResultsDiv.appendChild(missionTwoLabel);
        submitResultsDiv.appendChild(missionTwoSelect);
        submitResultsDiv.appendChild(missionThreeLabel);
        submitResultsDiv.appendChild(missionThreeSelect);
        submitResultsDiv.appendChild(missionFourLabel);
        submitResultsDiv.appendChild(missionFourSelect);
        submitResultsDiv.appendChild(missionFiveLabel);
        submitResultsDiv.appendChild(missionFiveSelect);
        submitResultsDiv.appendChild(assassinationRoleLabel);
        submitResultsDiv.appendChild(assassinationRoleSelect);
        submitResultsDiv.appendChild(assassinationFirstPlayerLabel);
        submitResultsDiv.appendChild(assassinationFirstPlayerSelect);
        submitResultsDiv.appendChild(assassinationSecondPlayerLabel);
        submitResultsDiv.appendChild(assassinationSecondPlayerSelect);
        root.appendChild(submitResultsDiv);

        assassinationRoleLabel.style.visibility = "hidden";
        hideSelect(assassinationRoleSelect);
        assassinationFirstPlayerLabel.style.visibility = "hidden";
        hideSelect(assassinationFirstPlayerSelect);
        assassinationSecondPlayerLabel.style.visibility = "hidden";
        hideSelect(assassinationSecondPlayerSelect);
        finishGameButton.removeAttribute("onclick");
        setButtonDisabled(finishGameButton, true);
    }

    function showTeams(resistancePlayers, spyPlayers) {
        if (finishGameButton) {
            finishGameButton.style.display = "none";
            finishGameButton.classList.add("future-disabled");
            finishGameButton.disabled = true;
            finishGameButton.onclick = "";
        }

        gameInformation.innerHTML = `
            <h2 class="resistance">Resistance</h2>
            <section>
            ${resistancePlayers.map(player => `<p>(<span class="resistance">${player.role}</span>): ${player.name}</p>`).join('')}
            </section>
            <h2 class="spy">Spies</h2>
            <section>
            ${spyPlayers.map(player => `<p>(<span class="spy">${player.role}</span>): ${player.name}</p>`).join('')}
            </section>
        `;
    }

    // Helper Functions
    function createDiv(id, styleClasses) {
        const divElement = document.createElement('div');
        divElement.id = id;
        for (let styleClass of styleClasses) {
            divElement.classList.add(styleClass);
        }
        return divElement;
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
        selectElement.id = id;
        const noneResultOption = createOption("none");
        noneResultOption.selected = true;
        if (!enableNoneOption) {
            noneResultOption.disabled = true;
        }
        selectElement.appendChild(noneResultOption);
        return selectElement;
    }

    function createMissionResultSelect(id, enableNoneOption) {
        const missionResultSelect = createSelect(id, enableNoneOption);
        missionResultSelect.appendChild(createOption("resistance", "Resistance"));
        missionResultSelect.appendChild(createOption("spies", "Spies"));
        return missionResultSelect;
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

    function clearChildrenFromElement(element) {
        while (element.children.length > 0) {
            element.removeChild(element.lastChild);
        }
    }

    function setButtonDisabled(buttonElement, disabled) {
        buttonElement.disabled = disabled;
        if (buttonElement.disabled) {
            addClassToElement(buttonElement, "future-disabled");
        } else {
            removeClassFromElement(buttonElement, "future-disabled");
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
});
