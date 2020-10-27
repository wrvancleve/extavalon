$(document).ready(function () {
    const socket = io.connect("https://extavalon.com");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    const gameCode = $("#game-code");
    gameCode.html(`Game Code: ${code}`);

    const startGame = $("#start-game-button");
    if (startGame) {
        startGame.click(function () {
            if (!startGame.disabled) {
                socket.emit('start-game');
            }
        });
    }

    const closeGame = $("#close-game-button");
    if (closeGame) {
        closeGame.click(function () {
            socket.emit('close-lobby');
        });
    }

    socket.on('update-players', currentPlayers => {
        $("#player-list").html(`
            ${currentPlayers.map(player => `<li>${player}</li>`).join('')}
        `);
        startGame.disabled = currentPlayers.length < 5;
        if (startGame.disabled) {
            startGame.addClass("future-color-disabled");
        } else {
            startGame.removeClass("future-color-disabled");
        }
    });

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

    socket.emit('join-lobby', {name, code});

    const openLobby = $("#lobby-open-button")[0];
    openLobby.onclick = function() {
        if (lobbyInformation.style.display == "none") {
            lobbyInformation.style.display = "block";
        } else {
            lobbyInformation.style.display = "none";
        }
    }

    const lobby = $("#lobby")[0];
    const roles = $("#roles")[0];

    const openRoles = $("#roles-open-button")[0];
    openRoles.onclick = function() {
        lobby.style.display = "none";
        openRoles.style.display = "none";
        openLobby.style.display = "none";
        roles.style.display = "block";
    }

    const closeRoles = $("#roles-close-button")[0];
    closeRoles.onclick = function() {
        roles.style.display = "none";
        lobby.style.display = "flex";
        openRoles.style.display = "block";
        openLobby.style.display = "block";
    }
});
