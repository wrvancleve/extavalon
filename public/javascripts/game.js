document.addEventListener('DOMContentLoaded', function () {
    const socket = io.connect("https://extavalon.com");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    document.getElementById("game-code").innerHTML = `Game Code: ${code}`;

    const openLobby = document.getElementById("lobby-open-button");
    const lobby = document.getElementById("lobby");
    const roles = document.getElementById("roles");
    const openRoles = document.getElementById("roles-open-button");
    const closeRoles = document.getElementById("roles-close-button");
    const startGame = document.getElementById("start-game-button");

    if (startGame) {
        const closeGame = document.getElementById("close-game-button");

        socket.on('update-players', currentPlayers => {
            const activePlayerCount = currentPlayers.filter(p => p.active).length;
            document.getElementById("player-count").innerHTML = `Players [${activePlayerCount}]`;
            document.getElementById("player-list").innerHTML = `
                ${currentPlayers.map(player => `<li class="${player.active ? 'player-active' : 'player-inactive'}">${player.name}</li>`).join('')}
            `;
            startGame.disabled = activePlayerCount < 5;
            if (startGame.disabled) {
                startGame.classList.add("future-disabled");
            } else {
                startGame.classList.remove("future-disabled");
            }
        });

        startGame.onclick = function () {
            socket.emit('start-game');
        };

        closeGame.onclick = function () {
            socket.emit('close-lobby');
        };
    }

    const lobbyInformation = document.getElementById("lobby-information");
    const gameInformation = document.getElementById("game-information");
    const playerName = document.getElementById("name");
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
        location.replace("https://extavalon.com/");
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
