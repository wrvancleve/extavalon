document.addEventListener('DOMContentLoaded', function () {
    //const socket = io.connect("https://extavalon.com");
    const socket = io.connect("http://localhost:8080");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    document.getElementById("game-code").innerHTML = `Game Code: ${code}`;

    const openLobby = document.getElementById("lobby-open-button");
    const lobby = document.getElementById("lobby");
    const lobbyInformation = document.getElementById("lobby-information");
    const gameInformation = document.getElementById("game-information");
    const playerName = document.getElementById("name");
    const roles = document.getElementById("modal-roles");
    const openRoles = document.getElementById("roles-open-button");
    const closeRoles = document.getElementById("roles-close-button");
    const startGame = document.getElementById("start-game-button");

    if (startGame) {
        const closeGame = document.getElementById("close-game-button");
        startGame.onclick = function () {
            socket.emit('start-game-local');
        };
        closeGame.onclick = function () {
            socket.emit('close-lobby');
        };
    } else {
        lobbyInformation.style.display = "none";
    }

    socket.on('update-players', currentPlayers => {
        const activePlayerCount = currentPlayers.filter(p => p.active).length;
        document.getElementById("lobby-player-count").innerHTML = `Players [${activePlayerCount}]`;
        document.getElementById("lobby-player-list").innerHTML = `
            ${currentPlayers.map(player => `<li class="${player.active ? 'player-active' : 'player-inactive'}">${player.name}</li>`).join('')}
        `;
        if (startGame) {
            startGame.disabled = activePlayerCount < 5;
            if (startGame.disabled) {
                startGame.classList.add("future-disabled");
            } else {
                startGame.classList.remove("future-disabled");
            }
        }
    });
    
    socket.on('start-game', ({gameHTML, amFirstPlayer}) => {
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

        if (startGame) {
            startGame.innerHTML = 'Play Again';
        }
    });

    socket.on('close-lobby', () => {
        //location.replace("https://extavalon.com/");
        location.replace("http://localhost:8080");
    });

    openLobby.onclick = function() {
        if (lobbyInformation.style.display === "none") {
            lobbyInformation.style.display = "block";
        } else {
            lobbyInformation.style.display = "none";
        }
    }

    openRoles.onclick = function() {
        lobby.style.display = "none";
        openRoles.style.display = "none";
        openLobby.style.display = "none";
        roles.style.display = "block";
    }

    closeRoles.onclick = function() {
        roles.style.display = "none";
        lobby.style.display = "flex";
        openRoles.style.display = "block";
        openLobby.style.display = "block";
    }

    socket.emit('join-lobby', {name, code});
});
