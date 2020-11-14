$(document).ready(function () {
    const socket = io.connect("https://extavalon.com");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    const gameCode = $("#game-code");
    gameCode.html(`Game Code: ${code}`);

    const openLobby = $("#lobby-open-button")[0];
    const lobby = $("#lobby")[0];
    const roles = $("#roles")[0];
    const openRoles = $("#roles-open-button")[0];
    const closeRoles = $("#roles-close-button")[0];
    const startGame = $("#start-game-button");

    // If host
    if (startGame) {
        const closeGame = $("#close-game-button");

        socket.on('update-players', currentPlayers => {
            const activePlayerCount = currentPlayers.filter(p => p.active === "player-active").length;
            $("#player-count").html(`Players [${activePlayerCount}]`);
            $("#player-list").html(`
                ${currentPlayers.map(player => `<li class="${player.active}">${player.name}</li>`).join('')}
            `);
            startGame.disabled = activePlayerCount < 5;
            if (startGame.disabled) {
                startGame.addClass("future-disabled");
            } else {
                startGame.removeClass("future-disabled");
            }
        });

        startGame.click(function () {
            socket.emit('start-game');
        });

        closeGame.click(function () {
            socket.emit('close-lobby');
        });
    }

    const lobbyInformation = $("#lobby-information")[0];
    const gameInformation = $("#game-information");
    socket.on('start-game', gameHTML => {
        lobbyInformation.style.display = "none";
        gameInformation.html(gameHTML);

        if (!gameInformation.hasClass("active")) {
            gameInformation.addClass("active");
        }

        if (startGame) {
            startGame.html('Play Again');
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
