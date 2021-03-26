document.addEventListener('DOMContentLoaded', function () {
    const {name, code} = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    const socket = io.connect(`https://extavalon.com?code=${code}&name=${name}`);
    //const socket = io.connect(`http://localhost:25565?code=${code}&name=${name}`);
    //const socket = io.connect(`http://192.168.1.107:25565?code=${code}&name=${name}`);

    // Get Elements
    const lobbyInformation = document.getElementById("lobby-information");
    const toggleHostInformationButton = document.getElementById("toggle-host-information-button");
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
    const boardArea = document.getElementById("board-area");
    const gameBoard = document.getElementById("game-board");

    let gamePlayers = [];
    let gunSelected = null;
    let playersSelected = null;
    let playerRole = null;
    const leftPlayerArea = document.getElementById("left-player-area");
    const topPlayerArea = document.getElementById("top-player-area");
    const rightPlayerArea = document.getElementById("right-player-area");

    const actionArea = document.getElementById("action-area");
    const selectGunAreaId = "select-gun-area";
    const selectActionAreaId = "select-action-area";
    const actionResultsAreaId = "action-results-area";

    const resultsModal = document.getElementById("results-modal");
    const closeResultsModalButton = document.getElementById("close-results-modal-button");
    const assassinationModal = document.getElementById("assassination-modal");
    const assassinationArea = document.getElementById("assassination-area");
    const resultsArea = document.getElementById("results-area");

    const missionInformationModal = document.getElementById("mission-information-modal");
    const closeMissionInformationModalButton = document.getElementById("close-mission-information-modal-button");
    const missionInformationArea = document.getElementById("mission-information-area");

    // Setup Page
    openIntelModalButton.onclick = function() {
        if (intelModal.style.display === "flex") {
            intelModal.style.display = "none";
        } else {
            if (rolesModal.style.display === 'flex') {
                rolesModal.style.display = 'none';
            }
            intelModal.style.display = "flex";
        }
    }
    closeIntelModalButton.onclick = function() {
        intelModal.style.display = "none";
    }
    if (toggleHostInformationButton) {
        toggleHostInformationButton.style.display = "none";
    }
    openIntelModalButton.style.display = "none";
    game.style.display = "none";

    openRolesModalButton.onclick = function() {
        if (rolesModal.style.display === "block") {
            rolesModal.style.display = "none";
        } else {
            if (intelModal.style.display === "flex") {
                intelModal.style.display = "none"
            }
            rolesModal.style.display = "block";
        }
    }

    closeRolesModalButton.onclick = function() {
        rolesModal.style.display = "none";
    }

    closeResultsModalButton.onclick = function() {
        resultsModal.style.display = "none";
    }

    closeMissionInformationModalButton.onclick = function() {
        missionInformationModal.style.display = "none";
    }

    if (startGameButton) {
        startGameButton.onclick = function () {
            socket.emit('start-game-online');
        };
        closeGameButton.onclick = function () {
            socket.emit('close-lobby');
        };
    }

    if (toggleHostInformationButton) {
        toggleHostInformationButton.onclick = function() {
            if (lobbyInformation.style.display === "none") {
                lobbyInformation.style.display = "flex";
                startGameButton.style.display = "block";
                closeGameButton.style.display = "block";
            } else {
                lobbyInformation.style.display = "none";
                startGameButton.style.display = "none";
                closeGameButton.style.display = "none";
            }
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

    function setupGame(gameHTML, players, role) {
        gamePlayers = [];
        gunSelected = null;
        playersSelected = null;
        playerRole = role;
        leftPlayerArea.innerHTML = "";
        topPlayerArea.innerHTML = "";
        rightPlayerArea.innerHTML = "";
        lobbyInformation.style.display = "none";
        if (startGameButton) {
            startGameButton.style.display = "none";
            closeGameButton.style.display = "none";
        }
        resultsModal.style.display = "none";
        missionInformationModal.style.display = "none";
        if (toggleHostInformationButton) {
            toggleHostInformationButton.style.display = "block";
        }
        openIntelModalButton.style.display = "block";
        game.style.display = "flex";
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

        intelModal.style.display = "flex";
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

    function showConfirmProposal() {
        actionArea.innerHTML = `
            <button class="future-color future-secondary-font future-box" type="button"
            id="confirm-proposal-button">Confirm Proposal</button>
        `;

        document.getElementById("confirm-proposal-button").onclick = function () {
            actionArea.innerHTML = "";
            submitProposal();
        };
    }

    function showAdvance() {
        actionArea.innerHTML += `
            <button class="future-color future-secondary-font future-box" type="button"
            id="advance-button">Advance</button>
        `;

        document.getElementById("advance-button").onclick = function () {
            actionArea.innerHTML = "";
            socket.emit('advance-mission');
        };
    }

    function setupProposal(gunSlots) {
        actionArea.innerHTML = "";

        if (gunSlots.length) {
            const gunArea = document.createElement('div');
            gunArea.id = selectGunAreaId;
            actionArea.appendChild(gunArea);
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
                gunArea.appendChild(gunImage);
            }
        } else {
            showConfirmProposal();
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
                const selectGunArea = document.getElementById(selectGunAreaId);
                if (selectGunArea && selectGunArea.childElementCount === 0) {
                    showConfirmProposal();
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
        if (gunSlot.alt !== gunSelected.alt) {
            if (gunSlot.alt === "Gun Slot") {
                gunSlot.style.visibility = "visible";
                gunSlot.src = `/images/${gunSelected.alt}.png`;
                gunSlot.alt = gunSelected.alt;
                gunSlot.classList.add("clickable");
                gunSlot.onclick = function () {
                    gunSelected = gunSlot;
                    attachNameClicks();
                };
    
                if (gunSelected.parentNode.id === selectGunAreaId) {
                    gunSelected.remove();
                } else {
                    gunSelected.src = "";
                    gunSelected.alt = "Gun Slot";
                    gunSelected.classList.remove("clickable");
                    gunSelected.onclick = "";
                    gunSelected.style.visibility = "hidden";
                }
            } else {
                const tempSrc = gunSlot.src;
                const tempAlt = gunSlot.alt;
                gunSlot.src = gunSelected.src;
                gunSlot.alt = gunSelected.alt;
                gunSelected.src = tempSrc;
                gunSelected.alt = tempAlt;
            }
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

        socket.emit('propose-team', {selectedIds});
    }

    function setupVote() {
        statusMessage.innerHTML = "Voting on team...";

        actionArea.innerHTML = `
            <div id="select-vote-area">
                <img class="vote-image clickable" id="approve-team-image" alt="Approve Team" src='/images/approve.png'></img>
                <img class="vote-image clickable" id="reject-team-image" alt="Reject Team" src='/images/reject.png'></img>
            </div>
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
        const selectActionArea = document.createElement('div');
        selectActionArea.id = selectActionAreaId;
        actionArea.appendChild(selectActionArea);
        selectActionArea.innerHTML = `
            <img class="action-image clickable" id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
        `; 
        if (failAllowed) {
            selectActionArea.innerHTML += `
                <img class="action-image clickable" id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
            `;
        }
        if (reverseAllowed) {
            selectActionArea.innerHTML += `
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
            const actionResultArea = document.createElement('div');
            actionResultArea.id = actionResultsAreaId;
            actionArea.appendChild(actionResultArea);
            for (let i = 0; i < result.successCount; i++) {
                actionResultArea.innerHTML += `
                    <img class="action-image" id="succeed-mission-image" alt="Succeed Mission" src='/images/success.png'></img>
                `;
            }
            for (let i = 0; i < result.failCount; i++) {
                actionResultArea.innerHTML += `
                    <img class="action-image" id="fail-mission-image" alt="Fail Mission" src='/images/fail.png'></img>
                `;
            }
            for (let i = 0; i < result.reverseCount; i++) {
                actionResultArea.innerHTML += `
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
                        resultImage.style.top = "17.5vh";
                        break;
                    case 6:
                        resultImage.style.left = "2.75vw";
                        resultImage.style.top = "16.5vh";
                        break;
                    case 7:
                        resultImage.style.left = "2vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "1.75vw";
                        resultImage.style.top = "17.75vh";
                        break;
                    case 9:
                        resultImage.style.left = "1.65vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "1.65vw";
                        resultImage.style.top = "17vh";
                        break;
                }
                break;
            case 1:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "9.5vw";
                        resultImage.style.top = "17.5vh";
                        break;
                    case 6:
                        resultImage.style.left = "9.75vw";
                        resultImage.style.top = "16.5vh";
                        break;
                    case 7:
                        resultImage.style.left = "9.4vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "9.25vw";
                        resultImage.style.top = "17.75vh";
                        break;
                    case 9:
                        resultImage.style.left = "9.45vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "9.45vw";
                        resultImage.style.top = "16.8vh";
                        break;
                }
                break;
            case 2:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "17.25vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 6:
                        resultImage.style.left = "16.6vw";
                        resultImage.style.top = "16.5vh";
                        break;
                    case 7:
                        resultImage.style.left = "16.65vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "16.35vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "17vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "17vw";
                        resultImage.style.top = "16.8vh";
                        break;
                }
                break;
            case 3:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "24.9vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 6:
                        resultImage.style.left = "23.45vw";
                        resultImage.style.top = "16.4vh";
                        break;
                    case 7:
                        resultImage.style.left = "23.75vw";
                        resultImage.style.top = "17.5vh";
                        break;
                    case 8:
                        resultImage.style.left = "23.6vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "24.6vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "24.65vw";
                        resultImage.style.top = "16.75vh";
                        break;
                }
                break;
            case 4:
                switch (gamePlayers.length) {
                    case 5:
                        resultImage.style.left = "32.75vw";
                        resultImage.style.top = "17vh";
                        break;
                    case 6:
                        resultImage.style.left = "30.35vw";
                        resultImage.style.top = "16.4vh";
                        break;
                    case 7:
                        resultImage.style.left = "31.1vw";
                        resultImage.style.top = "17.6vh";
                        break;
                    case 8:
                        resultImage.style.left = "30.8vw";
                        resultImage.style.top = "17.25vh";
                        break;
                    case 9:
                        resultImage.style.left = "32.25vw";
                        resultImage.style.top = "17.85vh";
                        break;
                    case 10:
                        resultImage.style.left = "32.35vw";
                        resultImage.style.top = "16.75vh";
                        break;
                }
                break;
        }
        if (playerRole.name === "Lamorak" || playerRole.name === "Claudas") {
            resultImage.classList.add("clickable");
        }
        boardArea.appendChild(resultImage);

        if (playerRole.name === "Lamorak" || playerRole.name === "Claudas") {
            resultImage.onclick = function () {
                showMissionInformation(result);
            }
        }
    }

    function showMissionInformation(result) {
        missionInformationModal.style.display = "flex";
        resultsModal.style.display = "none";
        rolesModal.style.display = "none";
        intelModal.style.display = "none";
        missionInformationArea.innerHTML = `
            <p>Team: ${result.team.map(player => `${player.name}`).join(', ')}</p>
            <p>Successes: ${result.successCount}</p>
            <p>Fails: ${result.failCount}</p>
            <p>Reverses: ${result.reverseCount}</p>
            <p>Approvers: ${result.approvers.map(player => `${player.name}`).join(', ')}</p>
        `;
    }

    function showGameResult(winner, message) {
        resultsModal.style.display = "flex";
        missionInformationModal.style.display = "none";
        rolesModal.style.display = "none";
        intelModal.style.display = "none";
        resultsArea.innerHTML = message;
        statusMessage.innerHTML = `${winner} wins!`;
        if (startGameButton) {
            startGameButton.style.display = "block";
            closeGameButton.style.display = "block";
        }
    }

    function disableAssassinationConfirm() {
        const confirmAssassinationButton = document.getElementById("confirm-assassination-button");
        confirmAssassinationButton.disabled = true;
        confirmAssassinationButton.classList.add("future-disabled");
        confirmAssassinationButton.onclick = "";
    }

    function correctPlayersSelected(option) {
        switch (option) {
            case "Lovers":
                return playersSelected.length === 2;
            case "Merlin":
            case "Arthur":
                return playersSelected.length === 1;
            default:
                return playersSelected.length === 1 || playersSelected.length === 2;
        }
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
                if (assassinationRolesSelect.value && correctPlayersSelected(assassinationRolesSelect.value)) {
                    confirmAssassinationButton.disabled = false;
                    confirmAssassinationButton.classList.remove("future-disabled");
                    confirmAssassinationButton.onclick = function () {
                        socket.emit('conduct-assassination', {ids: playersSelected, role: assassinationRolesSelect.value});
                        assassinationModal.style.display = "none";
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
        assassinationModal.style.display = "flex";
        assassinationArea.innerHTML = `
            <h3 id="assassination-header">Select Player(s) To Assassinate</h3>
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
        resultsModal.style.display = "flex";
        rolesModal.style.display = "none";
        intelModal.style.display = "none";
        resultsArea.innerHTML = message;
        statusMessage.innerHTML = `${winner} wins!`;
        if (startGameButton) {
            startGameButton.style.display = "block";
            closeGameButton.style.display = "block";
        }
    }

    // Attach Socket functions
    socket.on('update-players', currentPlayers => {
        updateLobby(currentPlayers);
    });
    
    socket.on('start-game', ({gameHTML, players, role}) => {
        setupGame(gameHTML, players, role);
    });

    socket.on('close-lobby', () => {
        location.replace("https://extavalon.com/");
        //location.replace("http://localhost:25565");
        //location.replace("http://192.168.1.107:25565");
    });

    socket.on('update-leader', ({previousLeaderId, leaderId}) => {
        updateLeader(previousLeaderId, leaderId);
    });

    socket.on('update-status', ({message}) => {
        statusMessage.innerHTML = message;
    });

    socket.on('react', () => {
        showAdvance();
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
});
