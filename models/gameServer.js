const lobbyManager = require('./lobbyManager');
const Game = require('./game');
const OnlineGame = require('./onlineGame');
const { choice } = require('../utils/random');
const {
    createGame,
    insertSingleAssassination,
    insertPairedAssassination,
    insertGamePlayer
} = require('./database');

function createGameServer(httpServer, sessionMiddleware) {
    const io = require('socket.io')(httpServer, {allowEIO3: true});
    io.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });

    function closeLobby(lobby) {
        const code = lobby.code;
        lobbyManager.delete(code);
        io.sockets.to(code).emit('lobby:close');
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
                    if (currentPlayer.userId === lobby.currentRolePicker) {
                        sendRolePick(game, currentPlayer);
                    } else {
                        sendRoleSetup(currentPlayer);
                    }
                }
                else {
                    sendRoleAssign(game, currentPlayer);

                    if (game.isOnlineGame()) {
                        sendMissionResultsInformation(game, socketId);

                        switch (gamePhase) {
                            case OnlineGame.PHASE_PROPOSE:
                                if (game.isCurrentLeader(currentPlayer.id)) {
                                    sendProposeTeam(game, currentPlayer);
                                } else {
                                    sendUpdateTeam(game, currentPlayer);
                                }
                                break;
                            case OnlineGame.PHASE_VOTE:
                                sendUpdateTeam(game, currentPlayer);
                                sendVoteTeam(game, currentPlayer);
                                break;
                            case OnlineGame.PHASE_VOTE_REACT:
                                sendVoteResult(game, currentPlayer);
                                if (currentPlayer.id === 0) {
                                    sendReact(socketId);
                                }
                                break;
                            case OnlineGame.PHASE_CONDUCT:
                                sendConductMission(game, currentPlayer);
                                break;
                            case OnlineGame.PHASE_CONDUCT_REACT:
                                sendMissionResult(game, socketId, true);
                                if (currentPlayer.id === 0) {
                                    sendReact(socketId);
                                }
                                break;
                            case Game.PHASE_REDEMPTION:
                                sendConductRedemption(game, currentPlayer);
                                break;
                            case Game.PHASE_ASSASSINATION:
                                sendConductAssassination(game, currentPlayer);
                                break;
                            case Game.PHASE_DONE:
                                sendGameResult(lobby, socketId);
                                break;
                        }
                    } else {
                        switch (gamePhase) {
                            case Game.PHASE_MISSIONS:
                                if (currentPlayer.id === 0) {
                                    sendGameSetup(game, currentPlayer);
                                }
                                break;
                            case Game.PHASE_REDEMPTION:
                                if (currentPlayer.id === 0) {
                                    sendConductRedemption(game, currentPlayer);
                                }
                                break;
                            case Game.PHASE_ASSASSINATION:
                                if (currentPlayer.id === 0) {
                                    sendConductAssassination(game, currentPlayer);
                                }
                                break;
                            case Game.PHASE_DONE:
                                sendGameResult(lobby, socketId);
                                break;
                        }
                    }
                }
            }
        }
    }

    function sendUpdatePlayers(lobby) {
        const players = lobby.playerCollection.getPlayers();
        const lobbyPlayers = lobby.playerCollection.getLobbyPlayers();
        for (let player of players) {
            io.sockets.to(player.socketId).emit('lobby:update-players', lobbyPlayers);
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
        if (!lobby.currentRolePicker) {
            lobby.currentRolePicker = getRolePickerUserId(lobby, players);
        }

        if (lobby.type === 'online') {
            lobby.game = new OnlineGame(players.map(({ displayName }) => ({ name: displayName })), lobby.currentStartingPlayerInformation.index, lobby.settings);
        } else {
            lobby.game = new Game(players.map(({ displayName }) => ({ name: displayName })), lobby.currentStartingPlayerInformation.index, lobby.settings);
        }
        lobby.lastGunSlots = null;
        lobby.playerCollection.clearPlayerIds();
        for (let i = 0; i < players.length; i++) {
            const currentPlayer = players[i];
            lobby.playerCollection.updatePlayerIdByUserId(currentPlayer.userId, i);
            if (currentPlayer.userId === lobby.currentRolePicker) {
                sendRolePick(lobby.game, currentPlayer);
            } else {
                sendRoleSetup(currentPlayer);
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

    function getRolePickerUserId(lobby, players) {
        const possibleRolePickers = [];
        for (let player of players) {
            if (!lobby.previousRolePickers.includes(player.userId)) {
                possibleRolePickers.push(player.userId);
            }
        }

        if (possibleRolePickers.length === 0) {
            lobby.previousRolePickers = [];
            Array.prototype.push.apply(possibleRolePickers, players.map(player => player.userId));
        }

        return choice(possibleRolePickers);
    }

    function handleRolePick(lobby, rolePickInformation) {
        const game = lobby.game;
        game.assignRoles(rolePickInformation);

        const players = lobby.playerCollection.getPlayers();
        for (var i = 0; i < players.length; i++) {
            const currentPlayer = players[i];
            sendRoleAssign(game, currentPlayer);
        }

        if (game.isOnlineGame()) {
            sendMissionResultsInformation(game, lobby.code);
            handleStartProposal(lobby);
        } else {
            sendGameSetup(game, lobby.playerCollection.getPlayerOfPlayerId(0));
        }
    }

    async function handleGameResult(lobby) {
        const game = lobby.game;
        const gameResult = game.getGameResult();
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
            await insertGamePlayer(gameId, player.userId, game.getPlayerRoleName(player.id));
        }
    }

    function sendRolePick(game, receiver) {
        io.sockets.to(receiver.socketId).emit('role:pick', game.getPossibleRoles());
    }

    function sendGameSetup(game, receiver) {
        io.sockets.to(receiver.socketId).emit('game:setup', game.getCurrentLeader().name);
    }

    function sendRoleSetup(receiver) {
        io.sockets.to(receiver.socketId).emit('role:setup');
    }

    function sendRoleAssign(game, receiver) {
        io.sockets.to(receiver.socketId).emit('role:assign', game.getRoleInformation(receiver.id));
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
        io.sockets.to(receiver.socketId).emit('proposal:setup', game.getSetupProposalInformation(receiver.id));
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
        io.sockets.to(receiver.socketId).emit('proposal:view', game.getCurrentProposedTeamInformation());
    }

    function handleProposeTeam(lobby, selectedIds) {
        lobby.game.finalizeProposalTeam(selectedIds);
        const gamePlayers = lobby.playerCollection.getGamePlayers();
        for (let gamePlayer of gamePlayers) {
            sendVoteTeam(lobby.game, gamePlayer);
        }
    }

    function sendVoteTeam(game, receiver) {
        io.sockets.to(receiver.socketId).emit('proposal:vote', game.getSetupVoteInformation(receiver.id));
    }

    function handleToggleAffect(lobby, sourceUserId, affectInformation) {
        const sourcePlayer = lobby.playerCollection.getPlayerOfUserId(sourceUserId);
        lobby.game.toggleAffect(sourcePlayer.id, affectInformation.playerId);
        io.sockets.to(sourcePlayer.socketId).emit('proposal:vote', lobby.game.getSetupVoteInformation(sourcePlayer.id));
    }

    function handleVoteTeam(lobby, userId, vote) {
        const playerId = lobby.playerCollection.getPlayerIdOfUserId(userId);
        const game = lobby.game;
        const alreadyVoted = game.hasPlayerVoted(playerId);
        const voteFinished = game.setProposalVote(playerId, vote);

        if (voteFinished) {
            for (let gamePlayer of lobby.playerCollection.getGamePlayers()) {
                sendVoteResult(game, gamePlayer);
            }
            
            if (game.phase !== OnlineGame.PHASE_VOTE_REACT) {
                sendMissionResultsInformation(game, lobby.code);
                
                if (game.phase === Game.PHASE_REDEMPTION) {
                    startConductRedemption(lobby);
                } else if (game.isGameOver()) {
                    finishGame(lobby);
                } else {
                    sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
                }
            } else {
                sendReact(lobby.playerCollection.getSocketIdOfPlayerId(0));
            }
        } else if (!alreadyVoted) {
            for (let gamePlayer of lobby.playerCollection.getGamePlayers()) {
                sendVoteTeam(game, gamePlayer);
            }
        }
    }

    function sendVoteResult(game, receiver) {
        const proposalResultInformation = game.getProposalResultExtendedInformation(receiver.id);
        if (proposalResultInformation) {
            io.sockets.to(receiver.socketId).emit('proposal:result', proposalResultInformation);
        }
    }

    function sendReact(receiver) {
        io.sockets.to(receiver).emit('react');
    }

    function handleAdvanceMission(lobby) {
        lobby.game.advance();
        if (lobby.game.phase === OnlineGame.PHASE_PROPOSE) {
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
        io.sockets.to(receiver.socketId).emit('mission:conduct', game.getConductMissionInformation(receiver.id));
    }

    function handleConductMission(lobby, userId, action) {
        const playerId = lobby.playerCollection.getPlayerIdOfUserId(userId);
        if (lobby.game.addMissionAction(playerId, action)) {
            sendMissionResultsInformation(lobby.game, lobby.code);
            sendMissionResult(lobby.game, lobby.code, true);
            if (lobby.game.phase === Game.PHASE_REDEMPTION) {
                startConductRedemption(lobby);
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
        io.sockets.to(receiver).emit('game:update-mission-results', game.getMissionResultsInformation());
    }

    function sendMissionResult(game, receiver, showActions, missionId) {
        const missionResult = game.getMissionResult(missionId);
        if (missionResult) {
            io.sockets.to(receiver).emit('mission:result', { result: missionResult, showActions: showActions });
        }
    }

    function handleMissionResults(lobby, missionResultsInformation) {
        lobby.game.setMissionResults(missionResultsInformation);
        if (lobby.game.phase === Game.PHASE_REDEMPTION) {
            startConductRedemption(lobby);
        } else if (lobby.game.phase === Game.PHASE_ASSASSINATION) {
            startConductAssassination(lobby);
        } else {
            finishGame(lobby);
        }
    }

    function startConductRedemption(lobby) {
        if (lobby.game.isOnlineGame()) {
            for (let gamePlayer of lobby.playerCollection.getGamePlayers()) {
                sendConductRedemption(lobby.game, gamePlayer);
            }
        } else {
            sendConductRedemption(lobby.game, lobby.playerCollection.getPlayerOfPlayerId(0));
        }
    }

    function sendConductRedemption(game, receiver) {
        io.sockets.to(receiver.socketId).emit('redemption:conduct', game.getConductRedemptionInformation(receiver.id));
    }

    function handleConductRedemption(lobby, redemptionAttemptInformation) {
        lobby.game.handleRedemptionAttempt(redemptionAttemptInformation.ids);
        if (lobby.game.phase === Game.PHASE_ASSASSINATION) {
            startConductAssassination(lobby);
        } else {
            finishGame(lobby);
        }
    }

    function startConductAssassination(lobby) {
        if (lobby.game.isOnlineGame()) {
            for (let gamePlayer of lobby.playerCollection.getGamePlayers()) {
                sendConductAssassination(lobby.game, gamePlayer);
            }
        } else {
            sendConductAssassination(lobby.game, lobby.playerCollection.getPlayerOfPlayerId(0));
        }
    }

    function sendConductAssassination(game, receiver) {
        io.sockets.to(receiver.socketId).emit('assassination:conduct', game.getConductAssassinationInformation(receiver.id));
    }

    function handleConductAssassination(lobby, conductAssassinationInformation) {
        lobby.game.handleAssassinationAttempt(conductAssassinationInformation);
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
        lobby.previousRolePickers.push(lobby.currentRolePicker);
        lobby.currentRolePicker = null;
    }

    function sendGameResult(lobby, receiver) {
        const gameResult = lobby.game.getGameResultInformation();
        if (gameResult) {
            io.sockets.to(receiver).emit('game:result', gameResult);
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

            socket.on('lobby:update-player-index', (playerIndexUpdateInformation) => {
                lobby.playerCollection.handleUpdatePlayerIndex(playerIndexUpdateInformation);
                sendUpdatePlayers(lobby);
            });

            socket.on('role:pick', (rolePickInformation) => {
                lobby.updateTime = Date.now();
                rolePickInformation.id = lobby.playerCollection.getPlayerIdOfUserId(userId);
                handleRolePick(lobby, rolePickInformation);
            });

            socket.on('game:start', () => {
                lobby.updateTime = Date.now();
                handleStartGame(lobby);
            });

            socket.on('proposal:update', (team) => {
                lobby.updateTime = Date.now();
                handleUpdateTeam(lobby, team);
            });

            socket.on('proposal:submit', (selectedIds) => {
                lobby.updateTime = Date.now();
                handleProposeTeam(lobby, selectedIds);
            });

            socket.on('affect:toggle', (affectInformation) => {
                lobby.updateTime = Date.now();
                handleToggleAffect(lobby, userId, affectInformation);
            });

            socket.on('proposal:vote', (vote) => {
                lobby.updateTime = Date.now();
                handleVoteTeam(lobby, userId, vote);
            });

            socket.on('mission:conduct', (action) => {
                lobby.updateTime = Date.now();
                handleConductMission(lobby, userId, action);
            });

            socket.on('mission:advance', () => {
                lobby.updateTime = Date.now();
                handleAdvanceMission(lobby);
            });

            socket.on('mission:results', (missionResultsInformation) => {
                lobby.updateTime = Date.now();
                handleMissionResults(lobby, missionResultsInformation);
            });

            socket.on('redemption:conduct', (redemptionAttemptInformation) => {
                lobby.updateTime = Date.now();
                handleConductRedemption(lobby, redemptionAttemptInformation);
            });

            socket.on('assassination:conduct', (conductAssassinationInformation) => {
                lobby.updateTime = Date.now();
                handleConductAssassination(lobby, conductAssassinationInformation);
            });

            socket.on('lobby:kick-player', (playerId) => {
                kickPlayer(lobby, playerId);
            });

            socket.on('lobby:close', () => {
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
