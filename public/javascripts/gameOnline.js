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
    const roles = document.getElementById("modal-roles");
    const openRoles = document.getElementById("roles-open-button");
    const closeRoles = document.getElementById("roles-close-button");
    const gameInformation = document.getElementById("modal-game-information");
    const openGameInformation = document.getElementById("game-information-open-button");
    const closeGameInformation = document.getElementById("game-information-close-button");
    const startGame = document.getElementById("start-game-button");
    const gameBoard = document.getElementById("game-board");

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
    
    let gamePlayers = [];
    const leftPlayers = document.getElementById("left-players");
    const topPlayers = document.getElementById("top-players");
    const rightPlayers = document.getElementById("right-players");
    socket.on('start-game', ({gameHTML, players}) => {
        gamePlayers = [];
        switch (players.length) {
            case 5:
                gameBoard.src = "/images/5-player-board.png";
                break;
            case 6:
                gameBoard.src = "/images/6-player-board.png";
                break;
            case 7:
                gameBoard.src = "/images/7-player-board.png";
                break;
            case 8:
                gameBoard.src = "/images/8-player-board.png";
                break;
            case 9:
                gameBoard.src = "/images/9-player-board.png";
                break;
            case 10:
                gameBoard.src = "/images/10-player-board.png";
                break;
        }

        lobby.style.display = "none";
        openGameInformation.style.display = "block";
        game.style.display = "block";
        gameInformation.innerHTML = gameHTML;

        switch (players.length) {
            case 5:
                leftPlayers.innerHTML = `
                    <h3 class="${players[0].status} left-player" id="player-0">${players[0].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-0"), id: 0, name: players[0].name});
                topPlayers.innerHTML = `
                    <h3 class="${players[1].status} top-player" id="player-1">${players[1].name}</h3>
                    <h3 class="${players[2].status} top-player" id="player-2">${players[2].name}</h3>
                    <h3 class="${players[3].status} top-player" id="player-3">${players[3].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-1"), id: 1, name: players[1].name});
                gamePlayers.push({element: document.getElementById("player-2"), id: 2, name: players[2].name});
                gamePlayers.push({element: document.getElementById("player-3"), id: 3, name: players[3].name});
                rightPlayers.innerHTML = `
                    <h3 class="${players[4].status} right-player" id="player-4">${players[4].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-4"), id: 4, name: players[4].name});
                break;
            case 6:
                leftPlayers.innerHTML = `
                    <h3 class="${players[1].status} left-player" id="player-1">${players[1].name}</h3>
                    <h3 class="${players[0].status} left-player" id="player-0">${players[0].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-0"), id: 0, name:players[0].name});
                gamePlayers.push({element: document.getElementById("player-1"), id: 1, name: players[1].name});
                topPlayers.innerHTML = `
                    <h3 class="${players[2].status} top-player" id="player-2">${players[2].name}</h3>
                    <h3 class="${players[3].status} top-player" id="player-3">${players[3].name}</h3>
                `;
                
                gamePlayers.push({element: document.getElementById("player-2"), id: 2, name: players[2].name});
                gamePlayers.push({element: document.getElementById("player-3"), id: 3, name: players[3].name});
                rightPlayers.innerHTML = `
                    <h3 class="${players[4].status} right-player" id="player-4">${players[4].name}</h3>
                    <h3 class="${players[5].status} right-player" id="player-5">${players[5].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-4"), id: 4, name: players[4].name});
                gamePlayers.push({element: document.getElementById("player-5"), id: 5, name: players[5].name});
                break;
            case 7:
                leftPlayers.innerHTML = `
                    <h3 class="${players[1].status} left-player" id="player-1">${players[1].name}</h3>
                    <h3 class="${players[0].status} left-player" id="player-0">${players[0].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-0"), id: 0, name:players[0].name});
                gamePlayers.push({element: document.getElementById("player-1"), id: 1, name: players[1].name});
                topPlayers.innerHTML = `
                    <h3 class="${players[2].status} top-player" id="player-2">${players[2].name}</h3>
                    <h3 class="${players[3].status} top-player" id="player-3">${players[3].name}</h3>
                    <h3 class="${players[4].status} top-player" id="player-4">${players[4].name}</h3>
                `;
                
                gamePlayers.push({element: document.getElementById("player-2"), id: 2, name: players[2].name});
                gamePlayers.push({element: document.getElementById("player-3"), id: 3, name: players[3].name});
                gamePlayers.push({element: document.getElementById("player-4"), id: 4, name: players[4].name});
                rightPlayers.innerHTML = `
                    <h3 class="${players[5].status} right-player" id="player-5">${players[5].name}</h3>
                    <h3 class="${players[6].status} right-player" id="player-6">${players[6].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-5"), id: 5, name: players[5].name});
                gamePlayers.push({element: document.getElementById("player-6"), id: 6, name: players[6].name});
                break;
            case 8:
                leftPlayers.innerHTML = `
                    <h3 class="${players[1].status} left-player" id="player-1">${players[1].name}</h3>
                    <h3 class="${players[0].status} left-player" id="player-0">${players[0].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-0"), id: 0, name:players[0].name});
                gamePlayers.push({element: document.getElementById("player-1"), id: 1, name: players[1].name});
                topPlayers.innerHTML = `
                    <h3 class="${players[2].status} top-player" id="player-2">${players[2].name}</h3>
                    <h3 class="${players[3].status} top-player" id="player-3">${players[3].name}</h3>
                    <h3 class="${players[4].status} top-player" id="player-4">${players[4].name}</h3>
                    <h3 class="${players[5].status} top-player" id="player-5">${players[5].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-2"), id: 2, name: players[2].name});
                gamePlayers.push({element: document.getElementById("player-3"), id: 3, name: players[3].name});
                gamePlayers.push({element: document.getElementById("player-4"), id: 4, name: players[4].name});
                gamePlayers.push({element: document.getElementById("player-5"), id: 5, name: players[5].name});
                rightPlayers.innerHTML = `
                    <h3 class="${players[6].status} right-player" id="player-6">${players[6].name}</h3>
                    <h3 class="${players[7].status} right-player" id="player-7">${players[7].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-6"), id: 6, name: players[6].name});
                gamePlayers.push({element: document.getElementById("player-7"), id: 7, name: players[7].name});
                break;
            case 9:
                leftPlayers.innerHTML = `
                    <h3 class="${players[2].status} left-player" id="player-2">${players[2].name}</h3>
                    <h3 class="${players[1].status} left-player" id="player-1">${players[1].name}</h3>
                    <h3 class="${players[0].status} left-player" id="player-0">${players[0].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-0"), id: 0, name:players[0].name});
                gamePlayers.push({element: document.getElementById("player-1"), id: 1, name: players[1].name});
                gamePlayers.push({element: document.getElementById("player-2"), id: 2, name: players[2].name});
                topPlayers.innerHTML = `
                    <h3 class="${players[3].status} top-player" id="player-3">${players[3].name}</h3>
                    <h3 class="${players[4].status} top-player" id="player-4">${players[4].name}</h3>
                    <h3 class="${players[5].status} top-player" id="player-5">${players[5].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-3"), id: 3, name: players[3].name});
                gamePlayers.push({element: document.getElementById("player-4"), id: 4, name: players[4].name});
                gamePlayers.push({element: document.getElementById("player-5"), id: 5, name: players[5].name});
                rightPlayers.innerHTML = `
                    <h3 class="${players[6].status} right-player" id="player-6">${players[6].name}</h3>
                    <h3 class="${players[7].status} right-player" id="player-7">${players[7].name}</h3>
                    <h3 class="${players[8].status} right-player" id="player-8">${players[8].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-6"), id: 6, name: players[6].name});
                gamePlayers.push({element: document.getElementById("player-7"), id: 7, name: players[7].name});
                gamePlayers.push({element: document.getElementById("player-8"), id: 8, name: players[8].name});
                break;
            case 10:
                leftPlayers.innerHTML = `
                    <h3 class="${players[2].status} left-player" id="player-2">${players[2].name}</h3>
                    <h3 class="${players[1].status} left-player" id="player-1">${players[1].name}</h3>
                    <h3 class="${players[0].status} left-player" id="player-0">${players[0].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-0"), id: 0, name:players[0].name});
                gamePlayers.push({element: document.getElementById("player-1"), id: 1, name: players[1].name});
                gamePlayers.push({element: document.getElementById("player-2"), id: 2, name: players[2].name});
                topPlayers.innerHTML = `
                    <h3 class="${players[3].status} top-player" id="player-3">${players[3].name}</h3>
                    <h3 class="${players[4].status} top-player" id="player-4">${players[4].name}</h3>
                    <h3 class="${players[5].status} top-player" id="player-5">${players[5].name}</h3>
                    <h3 class="${players[6].status} top-player" id="player-6">${players[6].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-3"), id: 3, name: players[3].name});
                gamePlayers.push({element: document.getElementById("player-4"), id: 4, name: players[4].name});
                gamePlayers.push({element: document.getElementById("player-5"), id: 5, name: players[5].name});
                gamePlayers.push({element: document.getElementById("player-6"), id: 6, name: players[6].name});
                rightPlayers.innerHTML = `
                    <h3 class="${players[7].status} right-player" id="player-7">${players[7].name}</h3>
                    <h3 class="${players[8].status} right-player" id="player-8">${players[8].name}</h3>
                    <h3 class="${players[9].status} right-player" id="player-9">${players[9].name}</h3>
                `;
                gamePlayers.push({element: document.getElementById("player-7"), id: 7, name: players[7].name});
                gamePlayers.push({element: document.getElementById("player-8"), id: 8, name: players[8].name});
                gamePlayers.push({element: document.getElementById("player-9"), id: 9, name: players[9].name});
                break;
        }

        if (startGame) {
            startGame.innerHTML = 'Play Again';
            startGame.disabled = true;
            startGame.style.display = "none";
            const closeGame = document.getElementById("close-game-button");
            closeGame.disabled = true;
            closeGame.style.display = "none";
        }
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

    socket.on('update-leader', ({previousLeaderId, leaderId}) => {
        if (gamePlayers[previousLeaderId].element.classList.contains("current-leader")) {
            gamePlayers[previousLeaderId].element.classList.remove("current-leader");
        }
        gamePlayers[leaderId].element.classList.add("current-leader");
    });

    socket.on('update-status', ({message}) => {
        document.getElementById("status-message").innerHTML = message;
    });

    const proposeTeam = document.getElementById("propose-team");
    const proposalPlayerList = document.getElementById("proposal-player-list");
    const proposalSubmitButton = document.getElementById("proposal-submit-button");
    socket.on('propose-team', ({count}) => {
        document.getElementById("proposal-header").innerHTML = `Select ${count} players`;
        proposeTeam.style.display = "block";
        proposalPlayerList.innerHTML = `
            ${gamePlayers.map(player => `
                <div class="setting-item">
                    <h3 class="future-color future-secondary-font">${player.name}</h3>
                    <input name="${player.id}" type="checkbox">
                </div>
            `).join('')}
        `;

        const checkboxes = proposalPlayerList.querySelectorAll("input[type=checkbox]");
        for (let i = 0; i < checkboxes.length; i++) {
            const checkbox = checkboxes[i];
            checkbox.onclick = function() {
                const checkedCount = proposalPlayerList.querySelectorAll("input[type=checkbox]:checked").length;
                proposalSubmitButton.disabled = checkedCount !== count;
                if (proposalSubmitButton.disabled) {
                    proposalSubmitButton.classList.add("future-disabled");
                } else {
                    proposalSubmitButton.classList.remove("future-disabled");
                }
            }
        }

        proposalSubmitButton.onclick = function() {
            proposeTeam.style.display = "none";
            proposalSubmitButton.disabled = true;
            proposalSubmitButton.classList.add("future-disabled");
            const selectedIds = [];
            for (let i = 0; i < checkboxes.length; i++) {
                const checkbox = checkboxes[i];
                if (checkbox.checked) {
                    const selectedId = parseInt(checkbox.name);
                    selectedIds.push(selectedId);
                }
            }
            socket.emit('propose-team', {selectedIds});
        }
    });

    const belowBoard = document.getElementById("below-board");

    socket.on('vote-team', ({leader, team}) => {
        belowBoard.innerHTML = `
            <h2>
            ${leader.name} proposes:<br> ${team.map(player => `${player.name}`).join('<br>')}
            </h2>
            <img class="clickable" id="approve-team-image" alt="Approve Team" src='/images/approve.png'></img>
            <img class="clickable" id="reject-team-image" alt="Reject Team" src='/images/reject.png'></img>
        `; 

        document.getElementById("approve-team-image").onclick = function() {
            socket.emit('vote-team', {vote: true});
            belowBoard.innerHTML= "";
        }

        document.getElementById("reject-team-image").onclick = function() {
            socket.emit('vote-team', {vote: false});
            belowBoard.innerHTML= "";
        }
    });

    socket.on('vote-result', ({result}) => {
        console.log(result);
    });

    socket.on('conduct-mission', ({failAllowed, reverseAllowed}) => {
        belowBoard.innerHTML = `
            <img class="clickable" id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
        `; 
        if (failAllowed) {
            belowBoard.innerHTML += `
                <img class="clickable" id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
            `;
        }
        if (reverseAllowed) {
            belowBoard.innerHTML += `
                <img class="clickable" id="reverse-mission-image" alt="Reverse Mission" src='/images/reverse.png'></img>
            `;
        }

        document.getElementById("succeed-mission-image").onclick = function() {
            socket.emit('conduct-mission', {action: 'Succeed'});
            belowBoard.innerHTML = "";
        }
        if (failAllowed) {
            document.getElementById("fail-mission-image").onclick = function() {
                socket.emit('conduct-mission', {action: 'Fail'});
                belowBoard.innerHTML = "";
            }
        }
        if (reverseAllowed) {
            document.getElementById("reverse-mission-image").onclick = function() {
                socket.emit('conduct-mission', {action: 'Reverse'});
                belowBoard.innerHTML = "";
            }
        }
    });

    const advanceButton = document.getElementById("advance-button");
    socket.on('mission-result', ({result}) => {
        /*
        {
            result: result,
            successCount: currentMission.actionCount - currentMission.failActionCount - currentMission.reverseActionCount,
            failCount: currentMission.failActionCount,
            reverseCount: currentMission.reverseActionCount,
            gameOver: gameOver
        };
        */
        
        belowBoard.innerHTML = "";
        for (let i = 0; i < result.successCount; i++) {
            belowBoard.innerHTML += `
                <img id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
            `;
        }
        for (let i = 0; i < result.failCount; i++) {
            belowBoard.innerHTML += `
                <img id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
            `;
        }
        for (let i = 0; i < result.reverseCount; i++) {
            belowBoard.innerHTML += `
                <img id="reverse-mission-image" alt="Reverse Mission" src='/images/reverse.png'></img>
            `;
        }

        advanceButton.onclick = function() {
            belowBoard.innerHTML = "";
            socket.emit('advance-mission');
            advanceButton.onclick = "";
        }
    });

    socket.on('game-result', ({result}) => {
        console.log(result);
        if (startGame) {
            startGame.disable = false;
            startGame.style.display = "block";
            const closeGame = document.getElementById("close-game-button");
            closeGame.disabled = false;
            closeGame.style.display = "block";
        }
    });

    socket.emit('join-lobby', {name, code});
});
