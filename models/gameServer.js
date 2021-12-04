const lobbyManager = require('./lobbyManager');
const Game = require('./game');
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
                const game = lobby.game;
                const gamePhase = game.phase;
                if (gamePhase === Game.PHASE_SETUP) {
                    if (currentPlayer.userId === lobby.currentIdentityPicker) {
                        sendPickIdentity(game, currentPlayer);
                    } else {
                        sendGameSetup(currentPlayer);
                    }
                }
                else {
                    sendStartGame(game, currentPlayer);
                    sendMissionResultsInformation(game, socketId);

                    switch (gamePhase) {
                        case Game.PHASE_PROPOSE:
                            if (game.isCurrentLeader(currentPlayer.id)) {
                                sendProposeTeam(game, currentPlayer);
                            } else {
                                sendUpdateTeam(game, currentPlayer);
                            }
                            break;
                        case Game.PHASE_VOTE:
                            sendUpdateTeam(game, currentPlayer);
                            sendVoteTeam(game, currentPlayer);
                            break;
                        case Game.PHASE_VOTE_REACT:
                            sendVoteResult(game, currentPlayer);
                            if (currentPlayer.id === 0) {
                                sendReact(socketId);
                            }
                            break;
                        case Game.PHASE_CONDUCT:
                            sendConductMission(game, currentPlayer);
                            break;
                        case Game.PHASE_CONDUCT_REACT:
                            sendMissionResult(game, socketId, true);
                            if (currentPlayer.id === 0) {
                                sendReact(socketId);
                            }
                            break;
                        case Game.PHASE_ASSASSINATION:
                            sendConductAssassination(game, currentPlayer);
                            break;
                        case Game.PHASE_DONE:
                            sendGameResult(lobby, socketId);
                            break;
                    }
                }
            }
        }
    }

    function sendUpdatePlayers(lobby) {
        const players = lobby.playerCollection.getPlayers();
        const lobbyPlayers = lobby.playerCollection.getLobbyPlayers();
        for (let player of players) {
            io.sockets.to(player.socketId).emit('update-players', lobbyPlayers);
        }
    }

    function kickPlayer(lobby, playerIndex) {
        lobby.playerCollection.removePlayer(playerIndex);
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
        for (var i = 0; i < players.length; i++) {
            const currentPlayer = players[i];
            sendStartGame(lobby.game, currentPlayer);
        }

        sendMissionResultsInformation(lobby.game, lobby.code);
        handleStartProposal(lobby);
    }

    async function handleGameResult(lobby) {
        const game = lobby.game;
        const gameResult = lobby.game.getGameResult();
        const gameId = await createGame(game.startTime, gameResult);
        if (gameResult.assassination) {
            const assassinationSuccessful = gameResult.winner === "Spies";
            if (gameResult.assassination.targets.length > 1) {
                await insertPairedAssassination(gameId,
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.assassin.id),
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.targets[0].id),
                    gameResult.assassination.role,
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.targets[1].id),
                    gameResult.assassination.role,
                    assassinationSuccessful);
            } else {
                await insertSingleAssassination(gameId,
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.assassin.id),
                    lobby.playerCollection.getUserIdOfPlayerId(gameResult.assassination.targets[0].id),
                    gameResult.assassination.role,
                    assassinationSuccessful);
            }
        }

        for (let player of lobby.playerCollection.getGamePlayers()) {
            await insertGamePlayer(gameId, player.userId, lobby.game.getPlayerRoleName(player.id));
        }
    }

    function sendPickIdentity(game, receiver) {
        io.sockets.to(receiver.socketId).emit('pick-identity', game.getPossibleRoles());
    }

    function sendGameSetup(receiver) {
        io.sockets.to(receiver.socketId).emit('setup-game');
    }

    function sendStartGame(game, receiver) {
        io.sockets.to(receiver.socketId).emit('start-game', game.getStartGameInformation(receiver.id));
    }

    function sendStatusMessage(message, receiver) {
        io.sockets.to(receiver).emit('update-status', message);
    }

    function handleStartProposal(lobby) {
        for (let player of lobby.playerCollection.getPlayers()) {
            if (lobby.game.isCurrentLeader(player.id)) {
                sendProposeTeam(lobby.game, player);
            } else {
                sendUpdateTeam(lobby.game, player);
            }
        }
    }

    function sendProposeTeam(game, receiver) {
        io.sockets.to(receiver.socketId).emit('propose-team', game.getSetupProposalInformation(receiver.id));
    }

    function handleUpdateTeam(lobby, team) {
        lobby.game.updateProposal(team);
        const currentLeaderId = lobby.game.currentLeaderId;
        for (let player of lobby.playerCollection.getPlayers()) {
            if (player.id !== currentLeaderId) {
                sendUpdateTeam(lobby.game, player);
            }
        }
    }

    function sendUpdateTeam(game, receiver) {
        io.sockets.to(receiver.socketId).emit('update-team', game.getCurrentProposedTeamInformation());
    }

    function handleProposeTeam(lobby, selectedIds) {
        lobby.game.finalizeProposalTeam(selectedIds);
        const gamePlayers = lobby.playerCollection.getGamePlayers();
        for (let gamePlayer of gamePlayers) {
            sendVoteTeam(lobby.game, gamePlayer);
        }
    }

    function sendVoteTeam(game, receiver) {
        io.sockets.to(receiver.socketId).emit('vote-team', game.getSetupVoteInformation(receiver.id));
    }

    function handleToggleAffect(lobby, sourceUserId, affectInformation) {
        const sourcePlayer = lobby.playerCollection.getPlayerOfUserId(sourceUserId);
        lobby.game.toggleAffect(sourcePlayer.id, affectInformation.playerId);
        io.sockets.to(sourcePlayer.socketId).emit('vote-team', game.getSetupVoteInformation(sourcePlayer.id));
    }

    function handleVoteTeam(lobby, userId, vote) {
        const playerId = lobby.playerCollection.getPlayerIdOfUserId(userId);
        const voteFinished = lobby.game.setProposalVote(playerId, vote);

        if (voteFinished) {
            for (let gamePlayer of lobby.playerCollection.getGamePlayers()) {
                sendVoteResult(lobby.game, gamePlayer);
            }
            
            if (lobby.game.phase !== Game.PHASE_VOTE_REACT) {
                sendMissionResultsInformation(lobby.game, lobby.code);
                
                if (lobby.game.phase === Game.PHASE_REDEMPTION) {
                    startRedemptionAttempt(lobby);
                } else if (lobby.game.isGameOver()) {
                    finishGame(lobby);
                } else {
                    sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
                }
            } else {
                sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
            }
        }
    }

    function sendVoteResult(game, receiver) {
        const proposalResultInformation = game.getProposalResultExtendedInformation(receiver.id);
        if (proposalResultInformation) {
            io.sockets.to(receiver.socketId).emit('vote-result', proposalResultInformation);
        }
    }

    function sendReact(receiver) {
        io.sockets.to(receiver).emit('react');
    }

    function handleAdvanceMission(lobby) {
        lobby.game.advance();
        if (lobby.game.phase === Game.PHASE_PROPOSE) {
            handleStartProposal(lobby);
        } else {
            handleStartConductMission(lobby);
        }
    }

    function handleStartConductMission(lobby) {
        const gamePlayers = lobby.playerCollection.getGamePlayers();
        for (let gamePlayer of gamePlayers) {
            sendConductMission(lobby.game, gamePlayer);
        }
    }

    function sendConductMission(game, receiver) {
        io.sockets.to(receiver.socketId).emit('conduct-mission', game.getConductMissionInformation(receiver.id));
    }

    function handleConductMission(lobby, userId, action) {
        const playerId = lobby.playerCollection.getPlayerIdOfUserId(userId);
        if (lobby.game.addMissionAction(playerId, action)) {
            sendMissionResultsInformation(lobby.game, lobby.code);
            sendMissionResult(lobby.game, lobby.code, true);
            if (lobby.game.phase === Game.PHASE_REDEMPTION) {
                startRedemptionAttempt(lobby);
            } else if (lobby.game.phase === Game.PHASE_ASSASSINATION) {
                startConductAssassination(lobby);
            } else if (lobby.game.isGameOver()) {
                finishGame(lobby);
            } else {
                sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
            }
        }
    }

    function sendMissionResultsInformation(game, receiver) {
        io.sockets.to(receiver).emit('mission-results', game.getMissionResultsInformation());
    }

    function sendMissionResult(game, receiver, showActions, missionId) {
        const missionResult = game.getMissionResult(missionId);
        if (missionResult) {
            io.sockets.to(receiver).emit('mission-result', { result: missionResult, showActions: showActions });
        }
    }

    function startRedemptionAttempt(lobby) {
        const gamePlayers = lobby.playerCollection.getGamePlayers();
        for (let gamePlayer of gamePlayers) {
            sendRedemptionAttempt(lobby.game, gamePlayer);
        }
    }

    function sendRedemptionAttempt(game, receiver) {
        io.sockets.to(receiver.socketId).emit('redemption-attempt', game.getConductRedemptionInformation(receiver.id));
    }

    function handleRedemptionAttempt(lobby, redemptionAttemptInformation) {
        lobby.game.processRedemptionAttempt(redemptionAttemptInformation);
        if (lobby.game.phase === Game.PHASE_ASSASSINATION) {
            startConductAssassination(lobby);
        } else {
            finishGame(lobby);
        }
    }

    function startConductAssassination(lobby) {
        const gamePlayers = lobby.playerCollection.getGamePlayers();
        for (let gamePlayer of gamePlayers) {
            sendConductAssassination(lobby.game, gamePlayer);
        }
    }

    function sendConductAssassination(game, receiver) {
        io.sockets.to(receiver.socketId).emit('conduct-assassination', game.getConductAssassinationInformation(receiver.id));
    }

    function handleConductAssassination(lobby, conductAssassinationInformation) {
        lobby.game.processAssassinationAttempt(conductAssassinationInformation);
        finishGame(lobby);
    }

    function finishGame(lobby) {
        handleGameResult(lobby).then(() => {
            handleEndGame(lobby);
            sendGameResult(lobby, lobby.code);
        });
    }

    function handleEndGame(lobby) {
        lobby.previousStartingPlayers.push(lobby.currentStartingPlayerInformation.userId);
        lobby.currentStartingPlayerInformation = null;
        lobby.previousIdentityPickers.push(lobby.currentIdentityPicker);
        lobby.currentIdentityPicker = null;
    }

    function sendGameResult(lobby, receiver) {
        const gameResult = lobby.game.getGameResultInformation();
        if (gameResult) {
            io.sockets.to(receiver).emit('game-result', gameResult);
        }
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

            socket.on('update-player-index', (playerIndexUpdateInformation) => {
                lobby.playerCollection.handleUpdatePlayerIndex(playerIndexUpdateInformation);
                sendUpdatePlayers(lobby);
            });

            socket.on('pick-identity', (identityPickInformation) => {
                lobby.updateTime = Date.now();
                identityPickInformation.id = lobby.playerCollection.getPlayerIdOfUserId(userId);
                handleIdentityPick(lobby, identityPickInformation);
            });

            socket.on('start-game', () => {
                lobby.updateTime = Date.now();
                handleStartGame(lobby);
            });

            socket.on('update-team', (team) => {
                lobby.updateTime = Date.now();
                handleUpdateTeam(lobby, team);
            });

            socket.on('propose-team', (selectedIds) => {
                lobby.updateTime = Date.now();
                handleProposeTeam(lobby, selectedIds);
            });

            socket.on('toggle-affect', (affectInformation) => {
                lobby.updateTime = Date.now();
                handleToggleAffect(lobby, userId, affectInformation);
            });

            socket.on('vote-team', (vote) => {
                lobby.updateTime = Date.now();
                handleVoteTeam(lobby, userId, vote);
            });

            socket.on('conduct-mission', (action) => {
                lobby.updateTime = Date.now();
                handleConductMission(lobby, userId, action);
            });

            socket.on('advance-mission', () => {
                lobby.updateTime = Date.now();
                handleAdvanceMission(lobby);
            });

            socket.on('redemption-attempt', (redemptionAttemptInformation) => {
                lobby.updateTime = Date.now();
                handleRedemptionAttempt(lobby, redemptionAttemptInformation);
            });

            socket.on('conduct-assassination', (conductAssassinationInformation) => {
                lobby.updateTime = Date.now();
                handleConductAssassination(lobby, conductAssassinationInformation);
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
