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
    const intelModalArea = document.getElementById("intel-modal-area");
    const openIntelModalButton = document.getElementById("open-intel-modal-button");
    const closeIntelModalButton = document.getElementById("close-intel-modal-button");
    const startGameButton = document.getElementById("start-game-button");
    const closeGameButton = document.getElementById("close-game-button");
    const game = document.getElementById("game");
    
    const statusMessage = document.getElementById("status-message");
    const advanceButton = document.getElementById("advance-button");
    const boardArea = document.getElementById("board-area");
    const gameBoard = document.getElementById("game-board");

    let gamePlayers = [];
    let gunSelected = null;
    let playersSelected = null;
    const leftPlayerArea = document.getElementById("left-player-area");
    const topPlayerArea = document.getElementById("top-player-area");
    const rightPlayerArea = document.getElementById("right-player-area");

    const actionArea = document.getElementById("action-area");

    const resultModal = document.getElementById("result-modal");
    const closeResultModalButton = document.getElementById("close-result-modal-button");
    const resultArea = document.getElementById("result-area");

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
    closeIntelModalButton.onclick = function() {
        intelModal.style.display = "none";
    }
    openIntelModalButton.style.display = "none";
    game.style.display = "none";

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

    closeResultModalButton.onclick = function() {
        resultModal.style.display = "none";
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
                    <div class="horizontal-player">
                        <img class="gun-image" id="${elementPrefix}-gun-slot" alt="Gun Slot" style="visibility:hidden"></img>
                        <h3 class="${status}" id="${elementPrefix}-name">${name}</h3>
                        <img class="vote-image" id="${elementPrefix}-vote-slot" alt="Vote Slot" style="visibility:hidden"></img>
                    </div>
                `; 
                break;
            case "Top":
                topPlayerArea.innerHTML += `
                    <div class="vertical-player">
                        <img class="gun-image" id="${elementPrefix}-gun-slot" alt="Gun Slot" style="visibility:hidden"></img>
                        <h3 class="${status}" id="${elementPrefix}-name">${name}</h3>
                        <img class="vote-image" id="${elementPrefix}-vote-slot" alt="Vote Slot" style="visibility:hidden"></img>
                    </div>
                `; 
                break;
            case "Right":
                rightPlayerArea.innerHTML += `
                    <div class="horizontal-player">
                        <img class="vote-image" id="${elementPrefix}-vote-slot" alt="Vote Slot" style="visibility:hidden"></img>
                        <h3 class="${status}" id="${elementPrefix}-name">${name}</h3>
                        <img class="gun-image" id="${elementPrefix}-gun-slot" alt="Gun Slot" style="visibility:hidden"></img>
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

    function getGunSlots() {
        const gunSlots = [];
        for (let i = 0; i < gamePlayers.length; i++) {
            const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
            if (gunSlot.style.visibility === "visible") {
                gunSlots.push(gunSlot.alt);
            } else {
                gunSlots.push("");
            }
        }
        return gunSlots;
    }

    function updateGunSlots(gunSlots) {
        if (gunSlots) {
            for (let i = 0; i < gamePlayers.length; i++) {
                const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
                gunSlot.style.visibility = "visible";
                if (gunSlots[i]) {
                    gunSlot.src = `/images/${gunSlots[i]}.png`;
                    gunSlot.alt = gunSlots[i];
                } else {
                    gunSlot.src = "";
                    gunSlot.alt = "Gun Slot";
                    gunSlot.style.visibility = "hidden";
                }
            }
        }
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

    function setupGame(gameHTML, players) {
        gamePlayers = [];
        gunSelected = null;
        playersSelected = null;
        leftPlayerArea.innerHTML = "";
        topPlayerArea.innerHTML = "";
        rightPlayerArea.innerHTML = "";
        lobby.style.display = "none";
        resultModal.style.display = "none";
        openIntelModalButton.style.display = "block";
        game.style.display = "block";
        intelModalArea.innerHTML = gameHTML;

        while (boardArea.children.length > 1) {
            boardArea.removeChild(boardArea.lastChild);
        }

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

        intelModal.style.display = "block";
    }

    function updateLeader(previousLeaderId, leaderId) {
        for (let id = 0; id < gamePlayers.length; id++) {
            const player = gamePlayers[id];
            const playerVoteSlot = document.getElementById(player.voteSlotId);
            playerVoteSlot.src = "";
            playerVoteSlot.style.visibility = "hidden";
            playerVoteSlot.alt = "Vote Slot";
            const playerGunSlot = document.getElementById(player.gunSlotId);
            playerGunSlot.src = "";
            playerGunSlot.style.visibility = "hidden";
            playerGunSlot.alt = "Gun Slot";

            if (id === previousLeaderId) {
                document.getElementById(player.nameId).classList.remove("current-leader");
            } else if (id === leaderId) {
                document.getElementById(player.nameId).classList.add("current-leader");
            }
        }

        actionArea.innerHTML = "";
        gunSelected = null;
    }

    function showAdvance(onclick) {
        advanceButton.disabled = false;
        advanceButton.classList.remove("future-disabled");
        advanceButton.onclick = onclick;
    }

    function hideAdvance() {
        advanceButton.disabled = true;
        advanceButton.classList.add("future-disabled");
        advanceButton.onclick = "";
    }

    function reactAdvance() {
        statusMessage.innerHTML = "Waiting for players to advance...";
        socket.emit('advance-mission');
        hideAdvance();
    }

    function setupProposal(gunSlots) {
        actionArea.innerHTML = "";

        if (gunSlots.length) {
            for (let i = 0; i < gunSlots.length; i++) {
                const gunSlot = gunSlots[i];
                const gunImage = document.createElement('img');
                gunImage.classList.add("gun-image");
                gunImage.classList.add("clickable");
                gunImage.alt = gunSlot;
                gunImage.src = `/images/${gunSlot}.png`;
                gunImage.onclick = function () {
                    gunSelected = gunImage;
                    attachNameClicks();
                };
                actionArea.appendChild(gunImage);
            }
        } else {
            showAdvance(submitProposal);
        }
    }

    function attachNameClicks() {
        for (let i = 0; i < gamePlayers.length; i++) {
            const playerName = document.getElementById(gamePlayers[i].nameId);
            playerName.classList.add("clickable");
            playerName.onclick = function () {
                handleNameClick(i);

                gunSelected = null;
                removeNameClicks();

                socket.emit('update-team', {gunSlots: getGunSlots()});
                if (actionArea.childElementCount > 0) {
                    hideAdvance();
                } else {
                    showAdvance(submitProposal);
                }
            };
        }
    }

    function removeNameClicks() {
        for (let i = 0; i < gamePlayers.length; i++) {
            const playerName = document.getElementById(gamePlayers[i].nameId);
            playerName.classList.remove("clickable");
            playerName.onclick = "";
        }
    }

    function handleNameClick(i) {
        const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
        gunSlot.style.visibility = "visible";
        gunSlot.src = `/images/${gunSelected.alt}.png`;
        gunSlot.alt = gunSelected.alt;
        gunSlot.classList.add("clickable");
        gunSlot.onclick = function () {
            gunSelected = gunSlot;
            attachNameClicks();
        };

        if (gunSelected.parentNode.id === actionArea.id) {
            gunSelected.remove();
        } else {
            gunSelected.src = "";
            gunSelected.alt = "Gun Slot";
            gunSelected.classList.remove("clickable");
            gunSelected.onclick = "";
            gunSelected.style.visibility = "hidden";
        }
    }

    function submitProposal() {
        const selectedIds = [];
        for (let i = 0; i < gamePlayers.length; i++) {
            const gunSlot = document.getElementById(gamePlayers[i].gunSlotId);
            if (gunSlot.style.visibility === "visible") {
                selectedIds.push(i);
                gunSlot.classList.remove("clickable");
                gunSlot.onclick = "";
            }
        }

        hideAdvance();
        socket.emit('propose-team', {selectedIds});
    }

    function setupVote() {
        statusMessage.innerHTML = "Voting on team...";

        actionArea.innerHTML = `
            <img class="vote-image clickable" id="approve-team-image" alt="Approve Team" src='/images/approve.png'></img>
            <img class="vote-image clickable" id="reject-team-image" alt="Reject Team" src='/images/reject.png'></img>
        `; 

        document.getElementById("approve-team-image").onclick = function() {
            socket.emit('vote-team', {vote: true});
            actionArea.innerHTML= "";
        }

        document.getElementById("reject-team-image").onclick = function() {
            socket.emit('vote-team', {vote: false});
            actionArea.innerHTML= "";
        }
    }

    function showVoteResult(votes, approved) {
        if (approved) {
            statusMessage.innerHTML = "Proposal Approved!";
        } else {
            statusMessage.innerHTML = "Proposal Rejected!";
        }

        for (let i = 0; i < gamePlayers.length; i++) {
            const voteSlot = document.getElementById(gamePlayers[i].voteSlotId);
            voteSlot.style.visibility = "visible";
            if (votes[i]) {
                voteSlot.src = "/images/approve.png";
            } else {
                voteSlot.src = "/images/reject.png";
            }
        }
    }

    function setupMission(failAllowed, reverseAllowed) {
        actionArea.innerHTML = `
            <img class="action-image clickable" id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
        `; 
        if (failAllowed) {
            actionArea.innerHTML += `
                <img class="action-image clickable" id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
            `;
        }
        if (reverseAllowed) {
            actionArea.innerHTML += `
                <img class="action-image clickable" id="reverse-mission-image" alt="Reverse Mission" src='/images/reverse.png'></img>
            `;
        }

        document.getElementById("succeed-mission-image").onclick = function() {
            socket.emit('conduct-mission', {action: 'Succeed'});
            actionArea.innerHTML = "";
        }
        if (failAllowed) {
            document.getElementById("fail-mission-image").onclick = function() {
                socket.emit('conduct-mission', {action: 'Fail'});
                actionArea.innerHTML = "";
            }
        }
        if (reverseAllowed) {
            document.getElementById("reverse-mission-image").onclick = function() {
                socket.emit('conduct-mission', {action: 'Reverse'});
                actionArea.innerHTML = "";
            }
        }
    }

    function showMissionResult(result, showActions) {
        if (showActions) {
            actionArea.innerHTML = "";
            for (let i = 0; i < result.successCount; i++) {
                actionArea.innerHTML += `
                    <img class="action-image" id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
                `;
            }
            for (let i = 0; i < result.failCount; i++) {
                actionArea.innerHTML += `
                    <img class="action-image" id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
                `;
            }
            for (let i = 0; i < result.reverseCount; i++) {
                actionArea.innerHTML += `
                    <img class="action-image" id="reverse-mission-image" alt="Reverse Mission" src='/images/reverse.png'></img>
                `;
            }
        }

        const missionId = boardArea.children.length - 1;
        const resultImage = document.createElement('img');
        resultImage.classList.add("result-image");
        if (result.result === "Success") {
            statusMessage.innerHTML = "Mission successful!";
            resultImage.alt = "Success";
            resultImage.src = "/images/successful-mission.png";
        } else {
            statusMessage.innerHTML = "Mission failed!";
            resultImage.alt = "Fail";
            resultImage.src = "/images/failed-mission.png";
        }
        switch (missionId) {
            case 0:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "1.5vw";
                        resultImage.style.top = "20.25vh";
                        break;
                    case 6:
                        resultImage.style.left = "2.75vw";
                        resultImage.style.top = "18.75vh";
                        break;
                    case 7:
                        resultImage.style.left = "1.5vw";
                        resultImage.style.top = "20.25vh";
                        break;
                    case 8:
                        resultImage.style.left = "1.5vw";
                        resultImage.style.top = "20.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "1.5vw";
                        resultImage.style.top = "20.75vh";
                        break;
                    case 10:
                        resultImage.style.left = "1.5vw";
                        resultImage.style.top = "19.35vh";
                        break;
                }
                break;
            case 1:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "10.5vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 6:
                        resultImage.style.left = "11vw";
                        resultImage.style.top = "18.75vh";
                        break;
                    case 7:
                        resultImage.style.left = "10.6vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 8:
                        resultImage.style.left = "10.35vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 9:
                        resultImage.style.left = "10.5vw";
                        resultImage.style.top = "20.5vh";
                        break;
                    case 10:
                        resultImage.style.left = "10.5vw";
                        resultImage.style.top = "19.35vh";
                        break;
                }
                break;
            case 2:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "19.75vw";
                        resultImage.style.top = "19.75vh";
                        break;
                    case 6:
                        resultImage.style.left = "19vw";
                        resultImage.style.top = "18.75vh";
                        break;
                    case 7:
                        resultImage.style.left = "19vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 8:
                        resultImage.style.left = "18.75vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 9:
                        resultImage.style.left = "19.45vw";
                        resultImage.style.top = "20.5vh";
                        break;
                    case 10:
                        resultImage.style.left = "19.5vw";
                        resultImage.style.top = "19.35vh";
                        break;
                }
                break;
            case 3:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "28.75vw";
                        resultImage.style.top = "19.75vh";
                        break;
                    case 6:
                        resultImage.style.left = "26.75vw";
                        resultImage.style.top = "18.75vh";
                        break;
                    case 7:
                        resultImage.style.left = "27.35vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 8:
                        resultImage.style.left = "27.05vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 9:
                        resultImage.style.left = "28.25vw";
                        resultImage.style.top = "20.5vh";
                        break;
                    case 10:
                        resultImage.style.left = "28.35vw";
                        resultImage.style.top = "19.35vh";
                        break;
                }
                break;
            case 4:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "38vw";
                        resultImage.style.top = "19.5vh";
                        break;
                    case 6:
                        resultImage.style.left = "34.8vw";
                        resultImage.style.top = "18.75vh";
                        break;
                    case 7:
                        resultImage.style.left = "36vw";
                        resultImage.style.top = "20vh";
                        break;
                    case 8:
                        resultImage.style.left = "35.75vw";
                        resultImage.style.top = "19.75vh";
                        break;
                    case 9:
                        resultImage.style.left = "37.25vw";
                        resultImage.style.top = "20.5vh";
                        break;
                    case 10:
                        resultImage.style.left = "37.35vw";
                        resultImage.style.top = "19.35vh";
                        break;
                }
                break;
        }
        boardArea.appendChild(resultImage);
    }

    function disableAssassinationConfirm() {
        const confirmAssassinationButton = document.getElementById("confirm-assassination-button");
        confirmAssassinationButton.disabled = true;
        confirmAssassinationButton.classList.add("future-disabled");
        confirmAssassinationButton.onclick = "";
    }

    function handleAssassinationClick(id) {
        const index = playersSelected.indexOf(id);
        if (index !== -1) {
            playersSelected.splice(index, 1);
        } else {
            playersSelected.push(id);
        }

        const confirmAssassinationButton = document.getElementById("confirm-assassination-button");
        const assassinationHeader = document.getElementById("assassination-header");

        if (playersSelected.length === 0) {
            assassinationHeader.innerHTML = "Select Player(s) To Assassinate";
            disableAssassinationConfirm();
        } else if (playersSelected.length > 2) {
            assassinationHeader.innerHTML = "Too Many Players Selected! Please Reset";
            disableAssassinationConfirm();
        } else {
            assassinationHeader.innerHTML = `
                Assassinate ${playersSelected.map(i => document.getElementById(gamePlayers[i].nameId).innerHTML).join(' and ')} as:
            `;

            const assassinationRolesSelect = document.getElementById("assassination-roles-select");
            assassinationRolesSelect.onchange = function() {
                if (assassinationRolesSelect.value) {
                    confirmAssassinationButton.disabled = false;
                    confirmAssassinationButton.classList.remove("future-disabled");
                    confirmAssassinationButton.onclick = function () {
                        socket.emit('conduct-assassination', {ids: playersSelected, role: assassinationRolesSelect.value});
                        actionArea.innerHTML = "";
                    };
                } else {
                    disableAssassinationConfirm();
                }
            }
            
            if (playersSelected.length === 2) {
                assassinationRolesSelect.innerHTML = `
                    <option value=""></option>
                    <option value="Lovers">Lovers</option>
                `;
            } else {
                assassinationRolesSelect.innerHTML = `
                    <option value=""></option>
                    <option value="Merlin">Merlin</option>
                    <option value="Arthur">Arthur</option>
                `;
            }
            disableAssassinationConfirm();
        }
    }

    function setupAssassination() {
        playersSelected = [];
        actionArea.innerHTML += `
            <div id="assassination-area">
                <h2 id="assassination-header">Select Player(s) To Assassinate</h2>
                <select id="assassination-roles-select">
                    <option value=""></option>
                    <option value="Merlin">Merlin</option>
                    <option value="Arthur">Arthur</option>
                    <option value="Lovers">Lovers</option>
                </select>
                <button class="future-color future-secondary-font future-box" type="button"
                    id="reset-assassination-button">Reset Assassination</button>
                <button class="future-color future-secondary-font future-disabled future-box" type="button"
                    id="confirm-assassination-button" disabled>Confirm Assassination</button>
            </div>
        `;

        for (let i = 0; i < gamePlayers.length; i++) {
            const nameElement = document.getElementById(gamePlayers[i].nameId);
            if (nameElement.classList.contains("resistance")) {
                nameElement.classList.add("clickable");
                nameElement.onclick = function () {
                    handleAssassinationClick(i);
                };
            }
        }

        document.getElementById("reset-assassination-button").onclick = function () {
            playersSelected = [];
            document.getElementById("assassination-header").innerHTML = "Select Player(s) To Assassinate";
            document.getElementById("assassination-roles-select").innerHTML = `
                <option value=""></option>
                <option value="Merlin">Merlin</option>
                <option value="Arthur">Arthur</option>
                <option value="Lovers">Lovers</option>
            `;
            disableAssassinationConfirm();
        };
    }

    function showGameResult(winner, message) {
        resultModal.style.display = "block";
        rolesModal.style.display = "none";
        intelModal.style.display = "none";
        resultArea.innerHTML = message;
        statusMessage.innerHTML = `${winner} wins!`;
        if (startGameButton) {
            startGameButton.disable = false;
            startGameButton.style.display = "block";
            closeGameButton.disabled = false;
            closeGameButton.style.display = "block";
        }
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

    socket.on('update-leader', ({previousLeaderId, leaderId}) => {
        updateLeader(previousLeaderId, leaderId);
    });

    socket.on('update-status', ({message}) => {
        statusMessage.innerHTML = message;
    });

    socket.on('react', () => {
        showAdvance(reactAdvance);
    });
    
    socket.on('propose-team', ({gunSlots}) => {
        setupProposal(gunSlots);
    });

    socket.on('update-team', ({gunSlots}) => {
        updateGunSlots(gunSlots);
    });

    socket.on('vote-team', () => {
        setupVote();
    });

    socket.on('vote-result', ({votes, approved}) => {
        showVoteResult(votes, approved);
    });

    socket.on('conduct-mission', ({failAllowed, reverseAllowed}) => {
        setupMission(failAllowed, reverseAllowed);
    });

    socket.on('mission-result', ({result, showActions}) => {
        showMissionResult(result, showActions);  
    });

    socket.on('conduct-assassination', () => {
        setupAssassination();
    });

    socket.on('game-result', ({winner, message}) => {
        showGameResult(winner, message);
    });

    socket.emit('join-lobby', {name, code});
});
