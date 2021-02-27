document.addEventListener('DOMContentLoaded', function () {
    //const socket = io.connect("https://extavalon.com");
    const socket = io.connect("http://localhost:8080");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    document.getElementById("game-code").innerHTML = `Game Code: ${code}`;

    const lobby = document.getElementById("lobby");
    const lobbyInformation = document.getElementById("lobby-information");
    const game = document.getElementById("game");
    const playerName = document.getElementById("name");
    const roles = document.getElementById("modal-roles");
    const openRoles = document.getElementById("roles-open-button");
    const closeRoles = document.getElementById("roles-close-button");
    const gameInformation = document.getElementById("modal-game-information");
    const openGameInformation = document.getElementById("game-information-open-button");
    const closeGameInformation = document.getElementById("game-information-close-button");
    const startGame = document.getElementById("start-game-button");    

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

    if (startGame) {
        const closeGame = document.getElementById("close-game-button");
        startGame.onclick = function () {
            socket.emit('start-game-online');
        };
        closeGame.onclick = function () {
            socket.emit('close-lobby');
        };
    }
    
    socket.on('start-game', ({gameHTML, players, playerIndex}) => {
        lobby.style.display = "none";
        openGameInformation.style.display = "block";
        game.style.display = "block";

        console.log("Players: %j", players);
        console.log(`Player Index: ${playerIndex}`);

        const currentPlayer = players[playerIndex];
        console.log("Player: %j", currentPlayer);
        if (currentPlayer.team === "Spies") {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if(player.team === "Spies"){
                    player.status = "spy";
                } else {
                    player.status = "resistance";
                }
            }
        } else {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                switch (currentPlayer.role) {
                    case "Merlin":
                        if(player.team === "Spies" && player.role !== "Mordred" || player.role === "Puck"){
                            player.status = "suspicious";
                        }
                        break;
                    case "Tristan":
                        if(player.role === "Iseult"){
                            player.status = "resistance";
                        }
                        break;
                    case "Iseult":
                        if(player.role === "Tristan"){
                            player.status = "resistance";
                        }
                        break;
                    case "Percival":
                        if(player.role === "Merlin" || player.role === "Morgana"){
                            player.status = "suspicious";
                        }
                        break;
                    case "Guinevere":
                        if(player.role === "Maelagant" || player.role === "Lancelot"){
                            player.status = "suspicious";
                        }
                        break;
                }
            }
        }

        console.log("Altered Players: %j", players);
        document.getElementById("game-player-list").innerHTML = `
            ${players.map(player => `<li class="${player.status}">${player.name}</li>`).join('')}
        `;

        gameInformation.innerHTML = gameHTML;
    });

    socket.on('close-lobby', () => {
        //location.replace("https://extavalon.com/");
        location.replace("http://localhost:8080");
    });

    openGameInformation.onclick = function() {
        if (gameInformation.style.display == "block") {
            gameInformation.style.display = "none";
        } else {
            if (roles.style.display == 'block') {
                roles.style.display = 'none';
            }
            gameInformation.style.display = "block";
        }
    }
    openGameInformation.style.display = "none";
    game.style.display = "none";

    closeGameInformation.onclick = function() {
        gameInformation.style.display = "none";
    }

    openRoles.onclick = function() {
        if (roles.style.display == "block") {
            roles.style.display = "none";
        } else {
            if (gameInformation.style.display == "block") {
                gameInformation.style.display = "none"
            }
            roles.style.display = "block";
        }
    }

    closeRoles.onclick = function() {
        roles.style.display = "none";
    }

    socket.emit('join-lobby', {name, code});
});
