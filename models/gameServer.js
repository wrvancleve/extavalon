const lobbyManager = require('./lobbyManager');
const Game = require('./game');
const GameState = require('./gameState');
const { choice } = require('../utils/random');
const {
    createGame,
    insertSingleAssassination,
    insertPairedAssassination,
    insertGamePlayer
} = require('./database');

function createGameServer(httpServer, sessionMiddleware) {
    const io = require('socket.io')(httpServer);
    io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });

    function closeLobby(lobby) {
        const code = lobby.code;
        lobbyManager.delete(code);
        io.sockets.to(code).emit('close-lobby');
    };

    setInterval(function () {
        var time = Date.now();
        for (let lobby of lobbyManager.lobbies.values()) {
            if (lobby.updateTime < (time - 3600000)) {
                closeLobby(lobby);
            }
        }
    }, 600000);

    function updatePlayer(lobby, socket) {
        const userId = socket.handshake.query.userId;
        const socketId = socket.id;
        lobby.playerCollection.updatePlayer(userId, socketId, true);

        if (lobby.game) {
            const currentPlayer = lobby.playerCollection.getPlayerOfUserId(userId);
            if (currentPlayer.id !== null) {
                if (lobby.type === 'online') {
                    if (lobby.game.state.phase === GameState.PHASE_SETUP) {
                        if (currentPlayer.userId === lobby.currentIdentityPicker) {
                            sendPickIdentity(lobby.game, currentPlayer);
                        } else {
                            sendGameSetup(currentPlayer);
                        }
                    } else {
                        sendStartOnlineGame(lobby.game, currentPlayer);
                        const leader = sendUpdateLeader(lobby.game, socketId);
                        sendMissionResults(lobby, socketId);
                        sendUpdateTeam(lobby.lastGunSlots, socketId);

                        if (lobby.game.state.phase >= GameState.PHASE_VOTE_REACT) {
                            sendVoteResult(lobby, socketId);
                        }

                        if (lobby.game.state.phase >= GameState.PHASE_CONDUCT_REACT) {
                            sendMissionResult(lobby, socketId, true);
                        }

                        switch (lobby.game.state.phase) {
                            case GameState.PHASE_PROPOSE:
                                sendStatusMessage(`${leader.name} is proposing team...`, socketId);
                                if (lobby.game.getCurrentLeader().id === currentPlayer.id) {
                                    sendProposeTeam(lobby, socketId);
                                }
                                break;
                            case GameState.PHASE_VOTE:
                                const currentProposal = lobby.game.getCurrentProposal();
                                let playerVote = null;
                                for (let [playerId, vote] of currentProposal.getVotes()) {
                                    sendPlayerVoted(playerId, socketId);
                                    if (playerId === currentPlayer.id) {
                                        playerVote = vote;
                                    }
                                }
                                sendVoteTeam(playerVote, socketId);
                                break;
                            case GameState.PHASE_VOTE_REACT:
                                if (currentPlayer.id === 0) {
                                    sendReact(socketId);
                                }
                                break;
                            case GameState.PHASE_CONDUCT:
                                const currentMission = lobby.game.getCurrentMission();
                                if (currentMission.getMissionTeam().includes(currentPlayer.id) && !currentMission.hasConducted(currentPlayer.id)) {
                                    sendConductMission(lobby.game, currentPlayer);
                                }
                                sendStatusMessage("Conducting mission...", socketId);
                                break;
                            case GameState.PHASE_CONDUCT_REACT:
                                if (currentPlayer.id === 0) {
                                    sendReact(socketId);
                                }
                                break;
                            case GameState.PHASE_ASSASSINATION:
                                const assassin = lobby.playerCollection.getPlayerOfPlayerId(lobby.game.state.assassinId);
                                if (currentPlayer.id === assassin.id) {
                                    sendConductAssassination(socketId);
                                }
                                sendStatusMessage(`${assassin.displayName} is choosing who to assassinate...`, socketId);
                                break;
                            case GameState.PHASE_DONE:
                                sendGameResult(lobby, socketId);
                                break;
                        }
                    }
                } else {
                    if (lobby.game.state.phase === GameState.PHASE_SETUP) {
                        if (currentPlayer.userId === lobby.currentIdentityPicker) {
                            sendPickIdentity(lobby.game, currentPlayer);
                        } else {
                            sendGameSetup(currentPlayer);
                        }
                    } else {
                        sendStartLocalGame(lobby.game, currentPlayer);
                    }
                }
            }
        }
    }

    function sendUpdatePlayers(lobby) {
        const players = lobby.playerCollection.getPlayers();
        const lobbyPlayers = lobby.playerCollection.getLobbyPlayers();
        const isLocalGame = lobby.type === 'local';
        for (let player of players) {
            if (isLocalGame) {
                io.sockets.to(player.socketId).emit('update-players', {
                    displayName: player.displayName,
                    currentPlayers: lobbyPlayers
                });
            } else {
                io.sockets.to(player.socketId).emit('update-players', {
                    currentPlayers: lobbyPlayers
                });
            }
        }
    }

    function kickPlayer(lobby, playerId) {
        lobby.playerCollection.removePlayer(playerId);
        sendUpdatePlayers(lobby);
    }

    function handleDisconnect(lobby, userId) {
        lobby.playerCollection.deactivatePlayer(userId);
        sendUpdatePlayers(lobby);
    }

    function handleStartGame(lobby) {
        const players = lobby.playerCollection.getPlayers();
        if (!lobby.currentStartingPlayerInformation) {
            lobby.currentStartingPlayerInformation = getStartingPlayerInformation(lobby, players);
        }
        if (!lobby.currentIdentityPicker) {
            lobby.currentIdentityPicker = getIdentityPickerUserId(lobby, players);
        }

        const game = new Game(players.map(({ displayName }) => ({ name: displayName })), lobby.currentStartingPlayerInformation.index, lobby.settings);
        lobby.game = game;
        lobby.lastGunSlots = null;
        lobby.playerCollection.clearPlayerIds();
        for (let i = 0; i < players.length; i++) {
            const currentPlayer = players[i];
            lobby.playerCollection.updatePlayerIdByUserId(currentPlayer.userId, i);
            if (currentPlayer.userId === lobby.currentIdentityPicker) {
                sendPickIdentity(lobby.game, currentPlayer);
            } else {
                sendGameSetup(currentPlayer);
            }
        }
    }

    function getStartingPlayerInformation(lobby, players) {
        const possibleStartingPlayers = [];
        for (let i = 0; i < players.length; i++) {
            const currentPlayer = players[i];
            if (!lobby.previousStartingPlayers.includes(currentPlayer.userId)) {
                possibleStartingPlayers.push({index: i, userId: currentPlayer.userId});
            }
        }

        if (possibleStartingPlayers.length === 0) {
            lobby.previousStartingPlayers = [];
            for (let i = 0; i < players.length; i++) {
                possibleStartingPlayers.push({index: i, userId: players[i].userId});
            }
        }

        return choice(possibleStartingPlayers);
    }

    function getIdentityPickerUserId(lobby, players) {
        const possibleIdentityPickers = [];
        for (let player of players) {
            if (!lobby.previousIdentityPickers.includes(player.userId)) {
                possibleIdentityPickers.push(player.userId);
            }
        }

        if (possibleIdentityPickers.length === 0) {
            lobby.previousIdentityPickers = [];
            Array.prototype.push.apply(possibleIdentityPickers, players.map(player => player.userId));
        }

        return choice(possibleIdentityPickers);
    }

    function handleIdentityPick(lobby, identityPickInformation) {
        lobby.game.assignRoles([identityPickInformation]);

        const players = lobby.playerCollection.getPlayers();
        const onlineGame = lobby.type === 'online';
        for (var i = 0; i < players.length; i++) {
            const currentPlayer = players[i];
            if (onlineGame) {
                sendStartOnlineGame(lobby.game, currentPlayer);
            } else {
                sendStartLocalGame(lobby.game, currentPlayer);
            }
        }

        if (onlineGame) {
            startProposal(lobby);
        }
    }

    async function processLocalGameResults(lobby, gameResult) {
        const game = lobby.game;
        const gameWinner = lobby.game.processLocalGameResult(gameResult.missions, gameResult.assassination);
        const gameId = await createGame(game, gameResult, gameWinner);
        if (gameResult.assassination) {
            const assassinationSuccessful = gameWinner === "Spies";
            if (gameResult.assassination.players.length > 1) {
                await insertPairedAssassination(gameId,
                    lobby.playerCollection.getUserIdOfPlayerId(game.state.assassinId),
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.players[0]),
                    gameResult.assassination.role,
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.players[1]),
                    gameResult.assassination.role,
                    assassinationSuccessful);
            } else {
                await insertSingleAssassination(gameId,
                    lobby.playerCollection.getUserIdOfPlayerId(game.state.assassinId),
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.players[0]),
                    gameResult.assassination.role,
                    assassinationSuccessful);
            }
        }

        for (let player of game.state.players) {
            await insertGamePlayer(gameId, lobby.playerCollection.getUserIdOfPlayerId(player.id), player.role.name);
        }
    }

    function finishLocalGame(lobby) {
        const resistancePlayers = lobby.game.getResistancePlayers();
        const spyPlayers = lobby.game.getSpyPlayers();
        handleEndGame(lobby);
        io.sockets.to(lobby.code).emit('finish-game-local', { resistancePlayers, spyPlayers });
    }

    function sendPickIdentity(game, receiver) {
        const possibleRoles = game.getPossibleRoles();
        io.sockets.to(receiver.socketId).emit('pick-identity', {
            possibleResistanceRoles: possibleRoles.resistanceRoles,
            possibleSpyRoles: possibleRoles.spyRoles
        });
    }

    function sendGameSetup(receiver) {
        io.sockets.to(receiver.socketId).emit('setup-game');
    }

    function sendStartLocalGame(game, receiver) {
        io.sockets.to(receiver.socketId).emit('start-game', {
            gameHTML: game.getPlayerHTML(receiver.id),
            amFirstPlayer: game.isCurrentLeader(receiver.id)
        });
    }

    function sendStartOnlineGame(game, receiver) {
        io.sockets.to(receiver.socketId).emit('start-game', {
            gameHTML: game.getPlayerHTML(receiver.id),
            players: game.getPlayerInformation(receiver.id)
        });
    }

    function sendUpdateLeader(game, receiver) {
        const leader = game.getCurrentLeader().getPlayerObject();
        const previousLeaderId = game.getPreviousLeader().id;
        io.sockets.to(receiver).emit('update-leader', { previousLeaderId: previousLeaderId, leaderId: leader.id });
        return leader;
    }

    function sendProposeTeam(lobby, receiver) {
        const currentMission = lobby.game.getCurrentMission();
        const gunSlots = [];
        for (let i = 0; i < currentMission.teamSize; i++) {
            const gunSlot = `gun-${i + 1}`;
            if (!lobby.lastGunSlots || !lobby.lastGunSlots.includes(gunSlot)) {
                gunSlots.push(gunSlot);
            }
        }
        io.sockets.to(receiver).emit('propose-team', { gunSlots: gunSlots });
    }

    function sendLocalProposeTeam(lobby, receiver) {
        
    }

    function startProposal(lobby) {
        const leader = sendUpdateLeader(lobby.game, lobby.code);
        sendStatusMessage(`${leader.name} is proposing team...`, lobby.code);
        lobby.lastGunSlots = null;
        sendProposeTeam(lobby, lobby.playerCollection.getSocketIdOfPlayerId(leader.id));
    }

    function sendUpdateTeam(gunSlots, receiver) {
        if (gunSlots) {
            io.sockets.to(receiver).emit('update-team', { gunSlots: gunSlots });
        }
    }

    function updateTeam(lobby, gunSlots) {
        lobby.lastGunSlots = gunSlots;
        sendUpdateTeam(gunSlots, lobby.code)
    }

    function sendVoteTeam(selectedVote, receiver) {
        io.sockets.to(receiver).emit('vote-team', { selectedVote: selectedVote });
    }

    function proposeTeam(lobby, selectedIds) {
        lobby.game.createProposal(selectedIds);
        sendVoteTeam(null, lobby.code);
    }

    function sendPlayerVoted(playerId, receiver) {
        io.sockets.to(receiver).emit('player-vote', { id: playerId });
    }

    function sendVoteResult(lobby, receiver) {
        const voteResult = lobby.game.getProposalResult();
        if (voteResult) {
            io.sockets.to(receiver).emit('vote-result', { votes: Object.fromEntries(voteResult.votes), approved: voteResult.approved });
        }
    }

    function sendReact(receiver) {
        io.sockets.to(receiver).emit('react');
    }

    function processVoteTeam(lobby, userId, vote) {
        const playerId = lobby.playerCollection.getPlayerIdOfUserId(userId);
        const voteFinished = lobby.game.setProposalVote(playerId, vote);
        sendPlayerVoted(playerId, lobby.code);
        if (voteFinished) {
            sendVoteResult(lobby, lobby.code);
            if (lobby.game.getCurrentPhase() !== GameState.PHASE_VOTE_REACT) {
                sendMissionResult(lobby, lobby.code, false);
                if (lobby.game.isGameOver()) {
                    handleEndGame(lobby);
                    sendGameResult(lobby, lobby.code);
                } else {
                    sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
                }
            } else {
                sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
            }
        }
    }

    function advanceMission(lobby) {
        lobby.game.advance();
        if (lobby.game.getCurrentPhase() === GameState.PHASE_PROPOSE) {
            startProposal(lobby);
        } else {
            conductMission(lobby);
        }
    }

    function sendConductMission(game, receiver) {
        const receiverPlayer = game.getPlayer(receiver.id);
        const playerRole = receiverPlayer.role;
        const playerTeam = receiverPlayer.team;
        const failAllowed = playerTeam === "Spies" || playerRole === "Puck";
        const reverseAllowed = playerRole === "Lancelot" || playerRole === "Maelagant";
        io.sockets.to(receiver.socketId).emit('conduct-mission', { failAllowed: failAllowed, reverseAllowed: reverseAllowed });
    }

    function sendStatusMessage(message, receiver) {
        io.sockets.to(receiver).emit('update-status', { message: message });
    }

    function conductMission(lobby) {
        const missionTeam = lobby.game.getCurrentProposal().team;
        for (let i = 0; i < missionTeam.length; i++) {
            const id = missionTeam[i];
            sendConductMission(lobby.game, lobby.playerCollection.getPlayerOfPlayerId(id));
        }
        sendStatusMessage("Conducting mission...", lobby.code);
    }

    function sendMissionResults(lobby, receiver) {
        for (let i = 0; i < lobby.game.state.currentMissionId; i++) {
            sendMissionResult(lobby, receiver, false, i);
        }
    }

    function sendMissionResult(lobby, receiver, showActions, missionId) {
        if (missionId === undefined) {
            missionId = lobby.game.state.currentMissionId;
        }
        const missionResult = lobby.game.getMissionResult(missionId);
        if (missionResult) {
            io.sockets.to(receiver).emit('mission-result', { result: missionResult, showActions: showActions });
        }
    }

    function processMissionAction(lobby, userId, action) {
        const playerId = lobby.playerCollection.getPlayerIdOfUserId(userId);
        if (lobby.game.addMissionAction(playerId, action)) {
            sendMissionResult(lobby, lobby.code, true);
            if (lobby.game.getCurrentPhase() === GameState.PHASE_ASSASSINATION) {
                const assassin = lobby.playerCollection.getPlayerOfPlayerId(lobby.game.state.assassinId);
                sendConductAssassination(assassin.socketId);
                sendStatusMessage(`${assassin.displayName} is choosing who to assassinate...`, lobby.code);
            } else if (lobby.game.isGameOver()) {
                handleEndGame(lobby);
                sendGameResult(lobby, lobby.code);
            } else {
                sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
            }
        }
    }

    function sendConductAssassination(receiver) {
        io.sockets.to(receiver).emit('conduct-assassination');
    }

    function sendGameResult(lobby, receiver) {
        const gameResult = lobby.game.getGameResult();
        if (gameResult) {
            io.sockets.to(receiver).emit('game-result', { winner: gameResult.winner, message: gameResult.message });
        }
    }

    function handleAssassination(lobby, ids, role) {
        lobby.game.processAssassinationAttempt(ids, role);
        handleEndGame(lobby);
        sendGameResult(lobby, lobby.code);
    }

    function handleEndGame(lobby) {
        lobby.previousStartingPlayers.push(lobby.currentStartingPlayerInformation.userId);
        lobby.currentStartingPlayerInformation = null;
        lobby.previousIdentityPickers.push(lobby.currentIdentityPicker);
        lobby.currentIdentityPicker = null;
    }

    io.on('connection', socket => {
        const code = socket.handshake.query.code;
        const userId = socket.handshake.query.userId;

        const lobby = lobbyManager.get(code);
        if (lobby) {
            lobby.updateTime = Date.now();
            if (!lobby.playerCollection.doesUserIdExist(userId)) {
                lobby.playerCollection.addPlayer(socket);
            } else {
                updatePlayer(lobby, socket);
            }
            socket.join(code);

            sendUpdatePlayers(lobby);

            socket.on('pick-identity', ({ identityPickInformation }) => {
                lobby.updateTime = Date.now();
                identityPickInformation.id = lobby.playerCollection.getPlayerIdOfUserId(userId);
                handleIdentityPick(lobby, identityPickInformation);
            });

            socket.on('start-game', () => {
                lobby.updateTime = Date.now();
                handleStartGame(lobby);
            });

            socket.on('setup-finish-game-local', () => {
                const assassinatablePlayers = lobby.game.getResistancePlayers().map(({ id, name }) => ({ id, name }));
                socket.emit('setup-finish-game-local', { assassinatablePlayers });
            });

            socket.on('finish-game-local', ({ gameResult }) => {
                processLocalGameResults(lobby, gameResult).then(() => {
                    finishLocalGame(lobby);
                });
            });

            socket.on('update-team-local', ({ gunSlots }) => {
                lobby.updateTime = Date.now();
                updateTeam(lobby, gunSlots);
            });

            socket.on('update-team', ({ gunSlots }) => {
                lobby.updateTime = Date.now();
                updateTeam(lobby, gunSlots);
            });

            socket.on('propose-team', ({ selectedIds }) => {
                lobby.updateTime = Date.now();
                proposeTeam(lobby, selectedIds);
            });

            socket.on('vote-team', ({ vote }) => {
                lobby.updateTime = Date.now();
                processVoteTeam(lobby, userId, vote);
            });

            socket.on('conduct-mission', ({ action }) => {
                lobby.updateTime = Date.now();
                processMissionAction(lobby, userId, action);
            });

            socket.on('advance-mission', () => {
                lobby.updateTime = Date.now();
                advanceMission(lobby);
            });

            socket.on('conduct-assassination', ({ ids, role }) => {
                lobby.updateTime = Date.now();
                handleAssassination(lobby, ids, role);
            });

            socket.on('kick-player', (playerId) => {
                kickPlayer(lobby, playerId);
            });

            socket.on('close-lobby', () => {
                closeLobby(lobby);
            });

            socket.on('disconnect', () => {
                lobby.updateTime = Date.now();
                handleDisconnect(lobby, userId);
            });
        }
    });
};

module.exports = createGameServer;
