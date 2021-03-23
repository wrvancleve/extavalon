document.addEventListener('DOMContentLoaded', function () {
    
    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    //const socket = io.connect(`https://extavalon.com?code=${code}&name=${name}`);
    const socket = io.connect(`http://localhost:25565?code=${code}&name=${name}`);
    //const socket = io.connect(`http://192.168.1.107:25565?code=${code}&name=${name}`);

    // Get elements
    const lobby = document.getElementById("lobby")
    const lobbyInformation = document.getElementById("lobby-information");
    const toggleLobbyButton = document.getElementById("toggle-lobby-button");
    const playerName = document.getElementById("name");
    const rolesModal = document.getElementById("roles-modal");
    const openRolesModalButton = document.getElementById("open-roles-modal-button");
    const closeRolesModalButton = document.getElementById("close-roles-modal-button");
    const startGameButton = document.getElementById("start-game-button");
    const closeGameButton = document.getElementById("close-game-button");
    const gameInformation = document.getElementById("game-information");

    // Setup Page
    document.getElementById("game-code").innerHTML = `Game Code: ${code}`;

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
        document.getElementById("lobby-player-count").innerHTML = `Players [${activePlayerCount}]`;
        document.getElementById("lobby-player-list").innerHTML = `
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
        //location.replace("https://extavalon.com/");
        location.replace("http://localhost:25565");
        //location.replace("http://192.168.1.107:25565");
    });
});
