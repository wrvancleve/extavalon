import {
    socket,
    amHost,
    backButton,
    menuButton,
    menuModal,
    viewHelpButton,
    viewLobbyButton,
    viewRoleButton,
    viewGameButton,
    lobbyContent,
    lobbyPlayers,
    startGameButton,
    closeLobbyButton,
    helpContent,
    gameContent,
    roleContent,
    LOBBY_PLAYER_COUNT_ID,
    createButton,
    createDiv,
    createParagraph,
    createSection,
    createHeaderTwo,
    createLabel,
    createOption,
    createSelect,
    addClassToElement,
    removeClassFromElement,
    hideElement,
    clearChildrenFromElement,
    setButtonDisabled,
    createSimplePlayerListGroupItem,
    clearGameContent,
    createLobbyPlayerList,
    showConductRedemption,
    showConductAssassination,
    showGameResult
} from './game.js';

const MISSION_RESULTS_WRAPPER_ID = "mission-results-wrapper";

const SELECT_VOTE_CONTAINER_ID = "select-vote-container";
const SELECT_MISSION_ACTION_CONTAINER_ID = "select-mission-action-container";
const MISSION_ACTIONS_CONTAINER_ID = "mission-actions-container";

const APPROVE_VOTE_TOKEN_SRC = "/images/approve-token.png";
const APPROVE_VOTE_ICON_SRC = "/images/approve-icon.png";
const APPROVE_VOTE_ALT = "Approve Team";
const REJECT_VOTE_TOKEN_SRC = "/images/reject-token.png"
const REJECT_VOTE_ICON_SRC = "/images/reject-icon.png"
const REJECT_VOTE_ALT = "Reject Team";
const SUCCEED_MISSION_IMG_SRC = "/images/success.png";
const SUCCEED_MISSION_IMG_ALT = "Succeed Mission";
const FAIL_MISSION_IMG_SRC = "/images/fail.png";
const FAIL_MISSION_IMG_ALT = "Fail Mission";
const REVERSE_MISSION_IMG_SRC = "/images/reverse.png";
const REVERSE_MISSION_IMG_ALT = "Reverse Mission";
const SUCCESSFUL_MISSION_IMG_SRC = "/images/successful-mission.png";
const SUCCESSFUL_MISSION_IMG_ALT = "Success";
const FAILED_MISSION_IMG_SRC = "/images/failed-mission.png";
const FAILED_MISSION_IMG_ALT = "Fail";

function createImage(id, src, alt, styleClasses) {
    const imageElement = document.createElement('img');
    if (id) {
        imageElement.id = id;
    }
    imageElement.src = src;
    imageElement.alt = alt;
    if (styleClasses) {
        for (let styleClass of styleClasses) {
            imageElement.classList.add(styleClass);
        }
    }
    return imageElement;
}

function createFullPlayerListGroupItem(player, styleClasses=["list-group-item"]) {
    const playerListGroupItem = createDiv(null, styleClasses);

    const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
    const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
    playerListGroupItemLeaderIcon.style.visibility = player.isLeader ? "visible" : "hidden";
    playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

    const playerAffectSlotWrapper = createDiv(null, ["icon-wrapper"]);
    if (player.affect != null) {
        let playerListGroupItemAffectIconSrc = null;
        if (player.affect.name === "Bind") {
            if (player.affect.type === "Resistance") {
                playerListGroupItemAffectIconSrc = "/images/resistance-bind.png";
            } else if (player.affect.type === "Spy") {
                playerListGroupItemAffectIconSrc = "/images/spy-bind.png";
            } else {
                playerListGroupItemAffectIconSrc = "/images/unknown-bind.png";
            }
        } else if (player.affect.name === "Protect") {
            if (player.affect.type === "Resistance") {
                playerListGroupItemAffectIconSrc = "/images/spy-protect.png";
            } else if (player.affect.type === "Spy") {
                playerListGroupItemAffectIconSrc = "/images/resistance-protect.png";
            } else {
                playerListGroupItemAffectIconSrc = "/images/unknown-protect.png";
            }
        }

        if (playerListGroupItemAffectIconSrc) {
            const playerListGroupItemAffectIcon = createImage(null, playerListGroupItemAffectIconSrc, "Affect Slot", ["affect-icon"]);
            playerAffectSlotWrapper.appendChild(playerListGroupItemAffectIcon);
        }
    }    

    const playerNameWrapper = createDiv(null, ["name-wrapper"]);
    const playerNameParagraph = createParagraph(player.name);
    playerNameWrapper.appendChild(playerNameParagraph);

    const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
    const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
    playerListGroupItemGunIcon.style.visibility = player.isOnTeam ? "visible" : "hidden";
    playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

    const playerVoteSlotWrapper = createDiv(null, ["icon-wrapper"]);
    if (player.vote !== undefined) {
        if (player.vote) {
            playerVoteSlotWrapper.appendChild(createImage(null, APPROVE_VOTE_ICON_SRC, "Vote Slot", ["vote-icon"]))
        } else {
            playerVoteSlotWrapper.appendChild(createImage(null, REJECT_VOTE_ICON_SRC, "Vote Slot", ["vote-icon"]))
        }
    }

    playerListGroupItem.appendChild(playerLeaderSlotWrapper);
    playerListGroupItem.appendChild(playerAffectSlotWrapper);
    playerListGroupItem.appendChild(playerNameWrapper);
    playerListGroupItem.appendChild(playerGunSlotWrapper);
    playerListGroupItem.appendChild(playerVoteSlotWrapper);

    return playerListGroupItem;
}

// Socket Handlers
socket.on('lobby:update-players', (currentPlayers) => {
    const activePlayerCount = currentPlayers.filter(p => p.active).length;
    document.getElementById(LOBBY_PLAYER_COUNT_ID).innerHTML = `Players [${activePlayerCount}]`;

    const lobbyPlayerList = createLobbyPlayerList(currentPlayers);

    if (amHost) {
        new Sortable(lobbyPlayerList, {
            animation: 350,
            onEnd: function (event) {
                /*
                var itemEl = event.item;  // dragged HTMLElement
                event.to;    // target list
                event.from;  // previous list
                event.oldIndex;  // element's old index within old parent
                event.newIndex;  // element's new index within new parent
                event.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
                event.newDraggableIndex; // element's new index within new parent, only counting draggable elements
                event.clone // the clone element
                event.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
                */
               socket.emit('lobby:update-player-index', {oldIndex: event.oldIndex, newIndex: event.newIndex});
            }
        });

        setButtonDisabled(startGameButton, activePlayerCount < 5, false);
    }

    lobbyPlayers.appendChild(lobbyPlayerList);
});

socket.on('role:assign', (roleHTML) => {
    startGame(roleHTML);
});

socket.on('proposal:setup', (setupProposalInformation) => {
    setupProposal(setupProposalInformation);
});

socket.on('proposal:view', (currentProposedTeamInformation) => {
    updateProposedTeam(currentProposedTeamInformation);
});

socket.on('proposal:vote', (setupVoteInformation) => {
    setupVote(setupVoteInformation);
});

socket.on('proposal:result', (proposalResultInformation) => {
    showVoteResult(proposalResultInformation);
});

socket.on('react', () => {
    showAdvance();
});

socket.on('mission:conduct', (conductMissionInformation) => {
    setupMission(conductMissionInformation);
});

socket.on('mission:result', ({result, showActions}) => {
    showMissionResult(result);
});

socket.on('game:update-mission-results', (missionResultsInformation) => {
    updateMissionResults(missionResultsInformation);
});

socket.on('redemption:conduct', (conductRedemptionInformation) => {
    handleConductRedemption(conductRedemptionInformation);
});

socket.on('assassination:conduct', (conductAssassinationInformation) => {
    handleConductAssassination(conductAssassinationInformation);
});

socket.on('game:result', (gameResultInformation) => {
    showGameResult(gameResultInformation, false);
});

// Socket Functions

function startGame(roleHTML) {
    hideElement(menuModal);
    hideElement(lobbyContent);
    hideElement(helpContent);
    hideElement(gameContent);
    clearGameContent();
    roleContent.innerHTML = roleHTML;
    roleContent.style.display = "flex";
    backButton.title = "Return To Game";
    backButton.style.display = "flex";
    viewRoleButton.style.display = "block";
    viewGameButton.style.display = "block";
    viewLobbyButton.innerText = "View Lobby";

    if (amHost) {
        startGameButton.innerHTML = 'New Game';
    }
}

function setupProposal(setupProposalInformation) {
    clearGameContent(false);

    const players = setupProposalInformation.players;
    const requiredTeamSize = setupProposalInformation.requiredTeamSize;

    gameContent.appendChild(createHeaderTwo(null, `Select ${requiredTeamSize} players for the mission:`));

    const proposeTeamContainer = createDiv("propose-team-container");
    const proposedTeamListGroup = createDiv("proposed-team-list-group", ["list-group"]);
    const playerSelections = [];

    const proposeTeamSubmitButton = createButton("Submit");
    proposeTeamSubmitButton.onclick = function() {
        setButtonDisabled(proposeTeamSubmitButton, true, false);
        socket.emit('proposal:submit', playerSelections);
        const otherPlayers = [];
        for (let i = 0; i < proposedTeamListGroup.children.length; i++) {
            const playerListGroupItem = proposedTeamListGroup.children[i];
            const playerId = Number(playerListGroupItem.getAttribute('data-value'));
            if (!playerSelections.includes(playerId)) {
                otherPlayers.push(playerListGroupItem);
            }
        }
        for (let playerListGroupItem of otherPlayers) {
            proposedTeamListGroup.removeChild(playerListGroupItem);
        }
        proposeTeamContainer.removeChild(proposeTeamSubmitButton);
    };

    for (let player of players) {
        const playerListGroupItem = createDiv(null, ["list-group-item", "clickable"]);
        playerListGroupItem.setAttribute('data-value', player.id);

        const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
        const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
        playerListGroupItemLeaderIcon.style.visibility = player.isLeader ? "visible" : "hidden";
        playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

        const playerNameWrapper = createDiv(null, ["name-wrapper"]);
        const playerNameParagraph = createParagraph(player.name);
        playerNameWrapper.appendChild(playerNameParagraph);

        const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
        const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
        if (player.isOnTeam) {
            playerListGroupItemGunIcon.style.visibility = "visible";
            playerSelections.push(player.id);
        }
        else {
            playerListGroupItemGunIcon.style.visibility = "hidden";
        }
        playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

        playerListGroupItem.appendChild(playerLeaderSlotWrapper);
        playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));
        playerListGroupItem.appendChild(playerNameWrapper);
        playerListGroupItem.appendChild(playerGunSlotWrapper);
        playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));

        playerListGroupItem.onclick = function() {
            const selected = playerSelections.includes(player.id);
            if (selected) {
                playerSelections.splice(playerSelections.indexOf(player.id), 1);
                playerListGroupItemGunIcon.style.visibility = "hidden";
                socket.emit('proposal:update', playerSelections);
            } else if (playerSelections.length !== requiredTeamSize) {
                playerSelections.push(player.id);
                playerListGroupItemGunIcon.style.visibility = "visible";
                socket.emit('proposal:update', playerSelections);
            }

            setButtonDisabled(proposeTeamSubmitButton, playerSelections.length !== requiredTeamSize, false);
        };
        proposedTeamListGroup.appendChild(playerListGroupItem);
    }
    setButtonDisabled(proposeTeamSubmitButton, playerSelections.length !== requiredTeamSize, false);

    proposeTeamContainer.appendChild(proposedTeamListGroup);
    proposeTeamContainer.appendChild(proposeTeamSubmitButton);
    gameContent.appendChild(proposeTeamContainer);
}

function updateProposedTeam(currentProposedTeamInformation) {
    clearGameContent(false);

    const leaderName = currentProposedTeamInformation.leaderName;
    const team = currentProposedTeamInformation.team;

    gameContent.appendChild(createHeaderTwo(null, `${leaderName} is proposing the mission team...`));

    const proposedTeamListGroup = createDiv("proposed-team-list-group", ["list-group"]);

    for (let i = 0; i < team.length; i++) {
        const player = team[i];
        const playerListGroupItem = createDiv(null, ["list-group-item"]);

        const playerLeaderSlotWrapper = createDiv(null, ["icon-wrapper"]);
        const playerListGroupItemLeaderIcon = createImage(null, "/images/leader.png", "Leader Slot", ["leader-icon"]);
        playerListGroupItemLeaderIcon.style.visibility = player.isLeader ? "visible" : "hidden";
        playerLeaderSlotWrapper.appendChild(playerListGroupItemLeaderIcon);

        const playerNameWrapper = createDiv(null, ["name-wrapper"]);
        const playerNameParagraph = createParagraph(player.name);
        playerNameWrapper.appendChild(playerNameParagraph);

        const playerGunSlotWrapper = createDiv(null, ["icon-wrapper"]);
        const playerListGroupItemGunIcon = createImage(null, "/images/gun-blank.png", "Gun Slot", ["gun-icon"]);
        playerGunSlotWrapper.appendChild(playerListGroupItemGunIcon);

        playerListGroupItem.appendChild(playerLeaderSlotWrapper);
        playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));
        playerListGroupItem.appendChild(playerNameWrapper);
        playerListGroupItem.appendChild(playerGunSlotWrapper);
        playerListGroupItem.appendChild(createDiv(null, ["icon-wrapper"]));

        proposedTeamListGroup.appendChild(playerListGroupItem);
    }
    
    gameContent.appendChild(proposedTeamListGroup);
}

function setupVote(setupVoteInformation) {
    clearGameContent(false);

    const selectedVote = setupVoteInformation.selectedVote;
    const team = setupVoteInformation.team;
    const applyAffect = setupVoteInformation.applyAffect;
    const playersStillVoting = setupVoteInformation.playersStillVoting;

    if (selectedVote !== undefined) {
        if (playersStillVoting.length > 3) {
            gameContent.appendChild(createHeaderTwo(null, `
                Still Voting: ${playersStillVoting.length} players
            `));
        } else {
            gameContent.appendChild(createHeaderTwo(null, `
                Still Voting: ${playersStillVoting.map(player => player.name).join(", ")}
            `));
        }
    }

    switch (applyAffect) {
        case "ResistanceProtect":
            gameContent.appendChild(createHeaderTwo(null, `You may select one player below to protect from a <span class="resistance">Resistance</span> bind.`));
            break;
        case "ResistanceBind":
            gameContent.appendChild(createHeaderTwo(null, `You may select one player below to bind to the <span class="resistance">Resistance</span>.`));
            break;
        case "SpyProtect":
            gameContent.appendChild(createHeaderTwo(null, `You may select one player below to protect from a <span class="spy">Spy</span> bind.`));
            break;
        case "SpyBind":
            gameContent.appendChild(createHeaderTwo(null, `You may select one player below to bind to the <span class="spy">Spies</span>.`));
            break;
    }

    const proposedTeamListGroup = createDiv("proposed-team-list-group", ["list-group"]);

    for (let i = 0; i < team.length; i++) {
        const player = team[i];
        const playerListGroupItem = createFullPlayerListGroupItem(player, ["list-group-item"]);

        if (applyAffect) {
            playerListGroupItem.onclick = function() {
                socket.emit('affect:toggle', {playerId: player.id});
            };
        }

        proposedTeamListGroup.appendChild(playerListGroupItem);
    }
    
    gameContent.appendChild(proposedTeamListGroup);

    const selectVoteContainer = createDiv(SELECT_VOTE_CONTAINER_ID);
    const approveTeamImage = createImage(null, APPROVE_VOTE_TOKEN_SRC, APPROVE_VOTE_ALT, ['vote-image', 'clickable']);
    approveTeamImage.onclick = function() {
        handleProposalVoteSelection(selectVoteContainer.children, approveTeamImage, true);
    }
    selectVoteContainer.appendChild(approveTeamImage);

    const rejectTeamImage = createImage(null, REJECT_VOTE_TOKEN_SRC, REJECT_VOTE_ALT, ['vote-image', 'clickable']);
    rejectTeamImage.onclick = function() {
        handleProposalVoteSelection(selectVoteContainer.children, rejectTeamImage, false);
    }
    selectVoteContainer.appendChild(rejectTeamImage);

    if (selectedVote === true) {
        approveTeamImage.classList.add("selected-image");
    } else if (selectedVote == false) {
        rejectTeamImage.classList.add("selected-image");
    }
    gameContent.appendChild(selectVoteContainer);
}

function handleProposalVoteSelection(voteOptions, selectedOption, selectedVote) {
    for (let option of voteOptions) {
        if (option.alt === selectedOption.alt) {
            addClassToElement(option, "selected-image");
        } else {
            removeClassFromElement(option, "selected-image");
        }
    }
    socket.emit('proposal:vote', selectedVote);
}

function showAdvance() {
    let advanceButton = document.getElementById("advance-button");
    if (!advanceButton) {
        showButton("Advance", function () {
            socket.emit('mission:advance');
        });
    }
}

function showButton(text, handleClick) {
    const button = createButton(text);
    button.onclick = handleClick;
    gameContent.appendChild(button);
}

function showVoteResult(proposalResultInformation) {
    clearGameContent(false);

    if (proposalResultInformation.result) {
        gameContent.appendChild(createHeaderTwo(null, "Proposal Approved!"));
    } else {
        gameContent.appendChild(createHeaderTwo(null, "Proposal Rejected!"));
    }

    const proposalVotesContainer = createDiv("proposal-votes-container");
    const proposalVotesListGroup = createDiv("proposal-votes-list-group", ["list-group"]);

    for (let playerVoteInformation of proposalResultInformation.voteInformation) {
        proposalVotesListGroup.appendChild(createFullPlayerListGroupItem(playerVoteInformation, ["list-group-item"]));
    }

    proposalVotesContainer.appendChild(proposalVotesListGroup);
    gameContent.appendChild(proposalVotesContainer);

    if (proposalResultInformation.bindInformation && proposalResultInformation.bindInformation.length > 0) {
        const bindSection = createSection();
        for (let bindInformation of proposalResultInformation.bindInformation) {
            bindSection.appendChild(createParagraph("*" + bindInformation));
        }
        bindSection.appendChild(createParagraph("*Not public information! Use caution if revealing!"));
        gameContent.appendChild(bindSection);
    }
    
}

function setupMission(conductMissionInformation) {
    clearGameContent(false);

    if (conductMissionInformation) {
        if (conductMissionInformation.sirRobinIntel !== undefined) {
            if (conductMissionInformation.sirRobinIntel) {
                gameContent.appendChild(createHeaderTwo(null, `
                    <span class="resistance">${conductMissionInformation.sirRobinIntel}</span> from the mission team is <span class="resistance">Resistance</span>.
                `));
            } else {
                gameContent.appendChild(createHeaderTwo(null, `
                    You either already know all the <span class="resistance">Resistance</span> players on this mission team
                    OR <span class="spy">Accolon</span> (if present) is on this mission team.
                `));
            }
        }

        if (conductMissionInformation.resistanceBound) {
            gameContent.appendChild(createHeaderTwo(null, `
                You have been <span class="resistance">Resistance</span> bounded for this mission! You can only play a success card.
            `));
        } else if (conductMissionInformation.spyBound) {
            gameContent.appendChild(createHeaderTwo(null, `
                You have been <span class="spy">Spy</span> bounded for this mission! You can only play a fail card.
            `));
        } else if (conductMissionInformation.spySuggestion) {
            gameContent.appendChild(createHeaderTwo(null, `
                Your <span class="spy">Spy</span> intuition says you should play a ${conductMissionInformation.spySuggestion.join(" or ")} card.
            `));
        }

        const successAllowed = conductMissionInformation.successAllowed;
        const failAllowed = conductMissionInformation.failAllowed;
        const reverseAllowed = conductMissionInformation.reverseAllowed;

        const selectMissionActionContainer = createDiv(SELECT_MISSION_ACTION_CONTAINER_ID);
        gameContent.appendChild(selectMissionActionContainer);

        if (successAllowed) {
            const successMissionActionImage = createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ['action-image', 'clickable']);
            successMissionActionImage.onclick = function () {
                handleMissionActionSelection(selectMissionActionContainer.children, successMissionActionImage, 'Succeed');
            };
            selectMissionActionContainer.appendChild(successMissionActionImage);
        }

        if (failAllowed) {
            const failMissionActionImage = createImage(null, FAIL_MISSION_IMG_SRC, FAIL_MISSION_IMG_ALT, ['action-image', 'clickable']);
            failMissionActionImage.onclick = function () {
                handleMissionActionSelection(selectMissionActionContainer.children, failMissionActionImage, 'Fail');
            };
            selectMissionActionContainer.appendChild(failMissionActionImage);
        }

        if (reverseAllowed) {
            const reverseMissionActionImage = createImage(null, REVERSE_MISSION_IMG_SRC, REVERSE_MISSION_IMG_ALT, ['action-image', 'clickable']);
            reverseMissionActionImage.onclick = function () {
                handleMissionActionSelection(selectMissionActionContainer.children, reverseMissionActionImage, 'Reverse');
            };
            selectMissionActionContainer.appendChild(reverseMissionActionImage);
        }
    } else {
        gameContent.appendChild(createHeaderTwo(null, `Waiting for mission to finish...`));
    }
}

function handleMissionActionSelection(actionOptions, selectedOption, selectedAction) {
    for (let option of actionOptions) {
        if (option.alt === selectedOption.alt) {
            addClassToElement(option, "selected-image");
        } else {
            removeClassFromElement(option, "selected-image");
        }
    }
    showConfirmMissionAction(selectedAction);
}

function showConfirmMissionAction(action) {
    const gameContentButtons = gameContent.getElementsByTagName("button");
    if (gameContentButtons.length === 0) {
        showButton("Confirm", function () {
            handleConfirmMissionActionClick(action);
        });
    } else {
        gameContentButtons[0].onclick = function () {
            handleConfirmMissionActionClick(action);
        };
    }
}

function handleConfirmMissionActionClick(action) {
    socket.emit('mission:conduct', action);
    clearGameContent(false);
    gameContent.appendChild(createHeaderTwo(null, `Waiting for mission to finish...`));
}

function showMissionResult(missionResultInformation) {
    clearGameContent(false);

    if (missionResultInformation.result === "Success") {
        gameContent.appendChild(createHeaderTwo(null, `Mission successful!`));
    } else {
        gameContent.appendChild(createHeaderTwo(null, `Mission failed!`));
    }

    const totalActions = missionResultInformation.successCount + missionResultInformation.failCount + missionResultInformation.reverseCount;
    const rowSize = totalActions === 4 ? 2 : 3;
    let actionsAdded = 0;

    const missionActionsContainer = createDiv(MISSION_ACTIONS_CONTAINER_ID);
    let currentActionsRow = null;

    for (let i = 0; i < missionResultInformation.successCount; i++) {
        if (actionsAdded % rowSize === 0) {
            if (currentActionsRow) {
                missionActionsContainer.appendChild(currentActionsRow);
            }
            currentActionsRow = createDiv("mission-actions-row");
        }
        currentActionsRow.appendChild(createImage(null, SUCCEED_MISSION_IMG_SRC, SUCCEED_MISSION_IMG_ALT, ["action-image"]));
        actionsAdded += 1;
    }
    for (let i = 0; i < missionResultInformation.failCount; i++) {
        if (actionsAdded % rowSize === 0) {
            if (currentActionsRow) {
                missionActionsContainer.appendChild(currentActionsRow);
            }
            currentActionsRow = createDiv("mission-actions-row");
        }
        currentActionsRow.appendChild(createImage(null, FAIL_MISSION_IMG_SRC, FAIL_MISSION_IMG_ALT, ["action-image"]));
        actionsAdded += 1;
    }
    for (let i = 0; i < missionResultInformation.reverseCount; i++) {
        if (actionsAdded % rowSize === 0) {
            if (currentActionsRow) {
                missionActionsContainer.appendChild(currentActionsRow);
            }
            currentActionsRow = createDiv("mission-actions-row");
        }
        currentActionsRow.appendChild(createImage(null, REVERSE_MISSION_IMG_SRC, REVERSE_MISSION_IMG_ALT, ["action-image"]));
        actionsAdded += 1;
    }

    missionActionsContainer.appendChild(currentActionsRow);
    gameContent.appendChild(missionActionsContainer);
}

function updateMissionResults(missionResultsInformation) {
    let missionResultsWrapper = document.getElementById(MISSION_RESULTS_WRAPPER_ID);
    if (!missionResultsWrapper) {
        missionResultsWrapper = createDiv(MISSION_RESULTS_WRAPPER_ID, []);
        gameContent.insertBefore(missionResultsWrapper, gameContent.firstChild);
    }

    clearChildrenFromElement(missionResultsWrapper);
    for (let missionInformation of missionResultsInformation.missions) {
        const missionResultWrapper = createDiv(null, ["mission-result-wrapper"]);
        if (missionInformation.result) {
            if (missionInformation.result === 'Success') {
                missionResultWrapper.appendChild(createImage(null, SUCCESSFUL_MISSION_IMG_SRC, SUCCESSFUL_MISSION_IMG_ALT));
            } else {
                missionResultWrapper.appendChild(createImage(null, FAILED_MISSION_IMG_SRC, FAILED_MISSION_IMG_ALT));
            }
        } else {
            let spanText = "";
            switch (missionInformation.teamSize) {
                case 2:
                    if (missionInformation.requiredFails === 1) {
                        spanText = "&#9313;";
                    } else {
                        spanText = "&#9462;";
                    }
                    break;
                case 3:
                    if (missionInformation.requiredFails === 1) {
                        spanText = "&#9314;";
                    } else {
                        spanText = "&#9463;";
                    }
                    break;
                case 4:
                    if (missionInformation.requiredFails === 1) {
                        spanText = "&#9315;";
                    } else {
                        spanText = "&#9464;";
                    }
                    break;
                case 5:
                    if (missionInformation.requiredFails === 1) {
                        spanText = "&#9316;";
                    } else {
                        spanText = "&#9465;";
                    }
                    break;
            }
            missionResultWrapper.appendChild(createParagraph(spanText));
        }
        missionResultsWrapper.appendChild(missionResultWrapper);
    }
}

function handleConductRedemption(conductRedemptionInformation) {
    clearGameContent(false);

    if ('kay' in conductRedemptionInformation) {
        gameContent.appendChild(createHeaderTwo(null, `
            ${conductRedemptionInformation.kay} is attempting to redeem the <span class="resistance">Resistance</span>...
        `));
    } else {
        showConductRedemption(conductRedemptionInformation);
    }
}

function handleConductAssassination(conductAssassinationInformation) {
    clearGameContent(false);

    if ('assassin' in conductAssassinationInformation) {
        gameContent.appendChild(createHeaderTwo(null, `${conductAssassinationInformation.assassin} is choosing who to assassinate...`));
    } else {
        showConductAssassination(conductAssassinationInformation);
    }
}
