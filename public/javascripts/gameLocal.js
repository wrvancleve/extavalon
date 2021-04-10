const ROOT_URL = "https://extavalon.com";
//const ROOT_URL = "http://localhost:25565";

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
const CLOSE_GAME_BUTTON_ID = "close-game-button";
const GAME_INFORMATION_ID = "game-information";
const GAME_CODE_ID = "game-code";

document.addEventListener('DOMContentLoaded', function () {
    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    const socket = io.connect(`${ROOT_URL}?code=${code}&name=${name}`);

    // Get elements
    const lobby = document.getElementById(LOBBY_ID);
    const lobbyInformation = document.getElementById(LOBBY_INFORMATION_ID);
    const toggleLobbyButton = document.getElementById(TOGGLE_LOBBY_BUTTON_ID);
    const playerName = document.getElementById(PLAYER_NAME_ID);
    const rolesModal = document.getElementById(ROLES_MODAL_ID);
    const openRolesModalButton = document.getElementById(OPEN_ROLES_MODAL_BUTTON_ID);
    const closeRolesModalButton = document.getElementById(CLOSE_ROLES_MODAL_BUTTON_ID);
    const startGameButton = document.getElementById(START_GAME_BUTTON_ID);
    const closeGameButton = document.getElementById(CLOSE_GAME_BUTTON_ID);
    const gameInformation = document.getElementById(GAME_INFORMATION_ID);

    // Setup Page
    document.getElementById(GAME_CODE_ID).innerHTML = `Game Code: ${code}`;

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
        closeGameButton.onclick = function () {
            socket.emit('close-lobby');
        };
    } else {
        lobbyInformation.style.display = "none";
    }

    // Setup Socket Functions
    function updateLobby(players) {
        const activePlayerCount = players.filter(p => p.active).length;
        document.getElementById(LOBBY_PLAYER_COUNT_ID).innerHTML = `Players [${activePlayerCount}]`;
        document.getElementById(LOBBY_PLAYER_LIST_ID).innerHTML = `
            ${players.map(player => `<li class="${player.active ? 'player-active' : 'player-inactive'}">${player.name}</li>`).join('')}
        `;
        if (startGameButton) {
            startGameButton.disabled = activePlayerCount < 5;
            if (startGameButton.disabled) {
                startGameButton.classList.add("future-disabled");
            } else {
                startGameButton.classList.remove("future-disabled");
            }
        }
    }

    function startGame(gameHTML, amFirstPlayer) {
        lobbyInformation.style.display = "none";

        if (amFirstPlayer) {
            if (!playerName.classList.contains("first-player")) {
                playerName.classList.add("first-player");
            }
        } else {
            if (playerName.classList.contains("first-player")) {
                playerName.classList.remove("first-player");
            }
        }

        gameInformation.innerHTML = gameHTML;

        if (!gameInformation.classList.contains("active")) {
            gameInformation.classList.add("active");
        }

        if (startGameButton) {
            startGameButton.innerHTML = 'Play Again';
        }
    }

    // Attach Socket functions
    socket.on('update-players', currentPlayers => {
        updateLobby(currentPlayers);
    });
    
    socket.on('start-game', ({gameHTML, amFirstPlayer}) => {
        startGame(gameHTML, amFirstPlayer);
    });

    socket.on('close-lobby', () => {
        location.replace(ROOT_URL);
    });
});
