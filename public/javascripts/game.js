$(document).ready(function () {
    const socket = io.connect("http://localhost:3000");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    const gameCode = $("#game-code");
    gameCode.html(`Game Code: ${code}`);

    const startGame = $("#start-game-button");
    startGame.click(function () {
        if (!startGame.disabled) {
            socket.emit('start-game');
        }
    });

    const closeGame = $("#close-game-button");
    closeGame.click(function () {
        socket.emit('close-lobby');
    });

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
    })

    socket.on('start-game', gameHTML => {
        const gameInformation = $("#game-information");
        gameInformation.html(gameHTML);
        if (!gameInformation.hasClass("active")) {
            gameInformation.addClass("active");
        }
        startGame.html('Play Again');
    });

    socket.on('close-lobby', () => {
        location.replace("http://localhost:25565/");
    });

    socket.emit('join-lobby', {name, code});

    const lobby = $("#lobby")[0];
    const roles = $("#roles")[0];
    const openRoles = $("#roles-open-button")[0];
    openRoles.onclick = function() {
        roles.style.display = "block";
        lobby.style.display = "none";
        openRoles.style.display = "none";
    }

    const closeRoles = $("#roles-close-button")[0];
    closeRoles.onclick = function() {
        roles.style.display = "none";
        lobby.style.display = "flex";
        openRoles.style.display = "block";
    }
});
