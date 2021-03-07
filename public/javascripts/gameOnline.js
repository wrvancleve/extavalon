document.addEventListener('DOMContentLoaded', function () {
    //const socket = io.connect("https://extavalon.com");
    const socket = io.connect("http://localhost:8080");

    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });    

    // Get Elements
    const lobby = document.getElementById("lobby");
    const rolesModal = document.getElementById("roles-modal");
    const openRolesModalButton = document.getElementById("open-roles-modal-button");
    const closeRolesModalButton = document.getElementById("close-roles-modal-button");
    const intelModal = document.getElementById("intel-modal");
    const openIntelModalButton = document.getElementById("open-intel-modal-button");
    const closeIntelModalButton = document.getElementById("close-intel-modal-button");
    const startGameButton = document.getElementById("start-game-button");
    const closeGameButton = document.getElementById("close-game-button");
    const game = document.getElementById("game");
    
    const statusMessage = document.getElementById("status-message");
    const advanceButton = document.getElementById("advance-button");
    const gameBoard = document.getElementById("game-board");

    let playerId = null;
    const gamePlayers = [];
    const leftPlayerArea = document.getElementById("left-player-area");
    const topPlayerArea = document.getElementById("top-player-area");
    const rightPlayerArea = document.getElementById("right-player-area");

    const actionArea = document.getElementById("action-area");

    let playersSelected = [];
    let gunSelected = null;

    const proposeTeam = document.getElementById("propose-team");
    const proposalPlayerList = document.getElementById("proposal-player-list");
    const proposalSubmitButton = document.getElementById("proposal-submit-button");

    // Setup Page
    document.getElementById("game-code").innerHTML = `Game Code: ${code}`;

    openIntelModalButton.onclick = function() {
        if (intelModal.style.display == "block") {
            intelModal.style.display = "none";
        } else {
            if (rolesModal.style.display == 'block') {
                rolesModal.style.display = 'none';
            }
            intelModal.style.display = "block";
        }
    }
    openIntelModalButton.style.display = "none";
    game.style.display = "none";

    closeIntelModalButton.onclick = function() {
        intelModal.style.display = "none";
    }

    openRolesModalButton.onclick = function() {
        if (rolesModal.style.display === "block") {
            rolesModal.style.display = "none";
        } else {
            if (intelModal.style.display === "block") {
                intelModal.style.display = "none"
            }
            rolesModal.style.display = "block";
        }
    }

    closeRolesModalButton.onclick = function() {
        rolesModal.style.display = "none";
    }

    if (startGameButton) {
        startGameButton.onclick = function () {
            socket.emit('start-game-online');
        };
        closeGameButton.onclick = function () {
            socket.emit('close-lobby');
        };
    }

    // Helper Function
    function hideElement(element) {
        element.style.display = "none";
        element.disable = true;
    }

    function createPlayer(player, section, unshift) {
        const name = player.name;
        const id = player.id;
        const status = player.status;
        const elementPrefix = `player-${id}`;
        switch (section) {
            case "Left":
                leftPlayerArea.innerHTML += `
                    <div>
                        <img class="player-gun-slot" id="${elementPrefix}-gun-slot" alt="Gun Slot" visibility="hidden"></img>
                        <h3 class="${status} right-player" id="${elementPrefix}-name">${name}</h3>
                        <img class="player-vote-slot" id="${elementPrefix}-vote-slot" alt="Vote Slot" visibility="hidden"></img>
                    </div>
                `; 
                break;
            case "Top":
                topPlayerArea.innerHTML += `
                    <div>
                        <img class="player-gun-slot" id="${elementPrefix}-gun-slot" alt="Gun Slot" visibility="hidden"></img>
                        <h3 class="${status} right-player" id="${elementPrefix}-name">${name}</h3>
                        <img class="player-vote-slot" id="${elementPrefix}-vote-slot" alt="Vote Slot" visibility="hidden"></img>
                    </div>
                `; 
                break;
            case "Right":
                rightPlayerArea.innerHTML += `
                    <div>
                        <img class="player-vote-slot" id="${elementPrefix}-vote-slot" alt="Vote Slot" visibility="hidden"></img>
                        <h3 class="${status} right-player" id="${elementPrefix}-name">${name}</h3>
                        <img class="player-gun-slot" id="${elementPrefix}-gun-slot" alt="Gun Slot" visibility="hidden"></img>
                    </div>
                `; 
                break;
        }

        const newPlayer = {
            id: id,
            nameId: `${elementPrefix}-name`,
            gunSlotId: `${elementPrefix}-gun-slot`,
            voteSlotId: `${elementPrefix}-vote-slot`
        };
        if (unshift) {
            gamePlayers.unshift(newPlayer);
        } else {
            gamePlayers.push(newPlayer);
        }
    }

    // Setup Socket Functions
    function updateLobby(players) {
        const activePlayerCount = players.filter(p => p.active).length;
        document.getElementById("lobby-player-count").innerHTML = `Players [${activePlayerCount}]`;
        document.getElementById("lobby-player-list").innerHTML = `
            ${players.map(player => `<li class="${player.active ? 'player-active' : 'player-inactive'}">${player.name}</li>`).join('')}
        `;
        if (host) {
            startGameButton.disabled = activePlayerCount < 5;
            if (startGameButton.disabled) {
                startGameButton.classList.add("future-disabled");
            } else {
                startGameButton.classList.remove("future-disabled");
            }
        }
    }

    function setupGame(gameHTML, players, id) {
        playerId = id;
        gamePlayers = [];
        gunSelected = null;
        playersSelected = null;
        leftPlayerArea.innerHTML = "";
        topPlayerArea.innerHTML = "";
        rightPlayerArea.innerHTML = "";
        lobby.style.display = "none";
        openIntelModalButton.style.display = "block";
        game.style.display = "block";
        intelModal.innerHTML = gameHTML;

        switch (players.length) {
            case 5:
                gameBoard.src = "/images/5-player-board.png";
                createPlayer(players[0], "Left");
                createPlayer(players[1], "Top");
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Right");
                break;
            case 6:
                gameBoard.src = "/images/6-player-board.png";
                createPlayer(players[1], "Left");
                createPlayer(players[0], "Left", true);
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Right");
                createPlayer(players[5], "Right");
                break;
            case 7:
                gameBoard.src = "/images/7-player-board.png";
                createPlayer(players[1], "Left");
                createPlayer(players[0], "Left", true);
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Right");
                createPlayer(players[6], "Right");
                break;
            case 8:
                gameBoard.src = "/images/8-player-board.png";
                createPlayer(players[1], "Left");
                createPlayer(players[0], "Left", true);
                createPlayer(players[2], "Top");
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Top");
                createPlayer(players[6], "Right");
                createPlayer(players[7], "Right");
                break;
            case 9:
                gameBoard.src = "/images/9-player-board.png";
                createPlayer(players[2], "Left");
                createPlayer(players[1], "Left", true);
                createPlayer(players[0], "Left", true);
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Top");
                createPlayer(players[6], "Right");
                createPlayer(players[7], "Right");
                createPlayer(players[8], "Right");
                break;
            case 10:
                gameBoard.src = "/images/10-player-board.png";
                createPlayer(players[2], "Left");
                createPlayer(players[1], "Left", true);
                createPlayer(players[0], "Left", true);
                createPlayer(players[3], "Top");
                createPlayer(players[4], "Top");
                createPlayer(players[5], "Top");
                createPlayer(players[6], "Top");
                createPlayer(players[7], "Right");
                createPlayer(players[8], "Right");
                createPlayer(players[9], "Right");
                break;
        }

        if (startGameButton) {
            startGameButton.innerHTML = 'Play Again';
            hideElement(startGameButton);
            hideElement(closeGameButton);
        }
    }

    function setupProposal(count) {
        for (let i = 0; i < count; i++) {
            const gunImage = document.createElement('img');
            gunImage.classList.add("clickable");
            gunImage.alt = "Gun";
            gunImage.src = `/images/gun-${i + 1}.png`;
            gunImage.onclick = function () {
                gunSelected = gunImage;
            };
            actionArea.appendChild(gunImage);
        }

        advanceButton.disabled = true;
        advanceButton.classList.add("future-disabled");

        for (let id = 0; id < gamePlayers.length; id++) {
            const playerName = document.getElementById(gamePlayers.nameId);
            playerName.classList.add("clickable");
            playerName.onclick = function () {
                if (gunSelected) {
                    const gunSlot = document.getElementById(gamePlayers.gunSlotId);
                    gunSlot.style.visibility = "visible";
                    gunSlot.src = gunImage.src;

                    if (gunSelected.parentNode.id === actionArea.id) {
                        gunSelected.remove();
                    } else {
                        gunSelected.src = "";
                        gunSelected.style.visibility = "hidden";
                    }

                    if (actionArea.childElementCount > 0) {
                        advanceButton.disabled = true;
                        advanceButton.classList.add("future-disabled");
                        advanceButton.onclick = "";
                    } else {
                        advanceButton.disabled = false;
                        advanceButton.classList.remove("future-disabled");
                        advanceButton.onclick = function() {
                            const selectedIds = [];
                            for (let i = 0; i < gamePlayers.length; i++) {
                                if (document.getElementById(gamePlayers[i].gunSlotId).src) {
                                    selectedIds.push(i);
                                }
                            }
                            socket.emit('propose-team', {selectedIds});
                            advanceButton.onclick = "";
                            advanceButton.disabled = true;
                            advanceButton.classList.add("future-disabled");
                        };
                    }
                }
            };
        }
    }

    function updateProposal () {

    }

    function setupVote() {
        statusMessage.innerHTML = "Voting on team...";

        actionArea.innerHTML = `
            <img class="clickable" id="approve-team-image" alt="Approve Team" src='/images/approve.png'></img>
            <img class="clickable" id="reject-team-image" alt="Reject Team" src='/images/reject.png'></img>
        `; 

        document.getElementById("approve-team-image").onclick = function() {
            socket.emit('vote-team', {id: playerId, vote: true});
            actionArea.innerHTML= "";
        }

        document.getElementById("reject-team-image").onclick = function() {
            socket.emit('vote-team', {id: playerId, vote: false});
            actionArea.innerHTML= "";
        }
    }

    function showVoteResult(votes) {
        for (let i = 0; i < gamePlayers.length; i++) {
            const voteSlot = document.getElementById(gamePlayers[i].voteSlotId);
            voteSlot.visibility = "visible";
            if (votes[i]) {
                voteSlot.src = "/images/approve.png";
            } else {
                voteSlot.src = "/images/reject.png";
            }
        }
    }

    function setupMission(failAllowed, reverseAllowed) {
        actionArea.innerHTML = `
            <img class="clickable" id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
        `; 
        if (failAllowed) {
            actionArea.innerHTML += `
                <img class="clickable" id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
            `;
        }
        if (reverseAllowed) {
            actionArea.innerHTML += `
                <img class="clickable" id="reverse-mission-image" alt="Reverse Mission" src='/images/reverse.png'></img>
            `;
        }

        document.getElementById("succeed-mission-image").onclick = function() {
            socket.emit('conduct-mission', {action: 'Succeed'});
            actionArea.innerHTML = "";
        }
        if (failAllowed) {
            document.getElementById("fail-mission-image").onclick = function() {
                socket.emit('conduct-mission', {id: playerId, action: 'Fail'});
                actionArea.innerHTML = "";
            }
        }
        if (reverseAllowed) {
            document.getElementById("reverse-mission-image").onclick = function() {
                socket.emit('conduct-mission', {id: playerId, action: 'Reverse'});
                actionArea.innerHTML = "";
            }
        }
    }

    function showMissionResult(result) {
        actionArea.innerHTML = "";
        for (let i = 0; i < result.successCount; i++) {
            actionArea.innerHTML += `
                <img id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
            `;
        }
        for (let i = 0; i < result.failCount; i++) {
            actionArea.innerHTML += `
                <img id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
            `;
        }
        for (let i = 0; i < result.reverseCount; i++) {
            actionArea.innerHTML += `
                <img id="reverse-mission-image" alt="Reverse Mission" src='/images/reverse.png'></img>
            `;
        }

        if (result.result === "Success") {
            statusMessage.innerHTML = "Mission successful!";
        } else {
            statusMessage.innerHTML = "Mission failed!";
        }

        advanceButton.onclick = function() {
            statusMessage.innerHTML = "Waiting for players to advance...";
            socket.emit('advance-mission');
            advanceButton.onclick = "";
            advanceButton.disabled = true;
            advanceButton.classList.add("future-disabled");
        }
    }

    function advanceMission() {
        for (let id = 0; id < gamePlayers.length; id++) {
            const player = gamePlayers[id];
            const playerVoteSlot = document.getElementById(player.voteSlotId);
            playerVoteSlot.src = "";
            playerVoteSlot.style.visibility = "hidden";
            const playerGunSlot = document.getElementById(player.gunSlotId);
            playerGunSlot.src = "";
            playerGunSlot.style.visibility = "hidden";
        }

        actionArea.innerHTML = "";
        gunSelected = null;
        playersSelected = [];
    }

    // Attach Socket functions
    socket.on('update-players', currentPlayers => {
        updateLobby(currentPlayers);
    });
    
    socket.on('start-game', ({gameHTML, players}) => {
        setupGame(gameHTML, players);
    });

    socket.on('close-lobby', () => {
        //location.replace("https://extavalon.com/");
        location.replace("http://localhost:8080");
    });

    socket.on('update-leader', ({previousLeaderId, leader}) => {
        if (gamePlayers[previousLeaderId].nameId.classList.contains("current-leader")) {
            gamePlayers[previousLeaderId].nameId.classList.remove("current-leader");
        }
        gamePlayers[leader.id].nameId.classList.add("current-leader");
        statusMessage.innerHTML = `${leader.name} is proposing team...`;
    });

    socket.on('update-status', ({message}) => {
        statusMessage.innerHTML = message;
    });
    
    socket.on('propose-team', ({count}) => {
        setupProposal(count);
    });

    socket.on('update-team', ({selectedIds}) => {
        updateProposal(selectedIds);
    });

    socket.on('vote-team', () => {
        setupVote();
    });

    socket.on('vote-result', ({result}) => {
        showVoteResult(result);
    });

    socket.on('conduct-mission', ({failAllowed, reverseAllowed}) => {
        setupMission(failAllowed, reverseAllowed);
    });

    socket.on('mission-result', ({result}) => {
        showMissionResult(result);  
    });

    socket.on('advance-mission', () => {
        advanceMission();
    });

    socket.on('game-result', ({result}) => {
        statusMessage.innerHTML = `${result} wins!`;
        if (startGameButton) {
            startGameButton.disable = false;
            startGameButton.style.display = "block";
            closeGameButton.disabled = false;
            closeGameButton.style.display = "block";
        }
    });

    socket.emit('join-lobby', {name, code});
});
