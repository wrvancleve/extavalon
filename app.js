require('dotenv').config({ path: `${__dirname}/.env` })

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const expressSession = require('express-session');
//const mongoose = require('mongoose');
const http = require('http');

const indexRouter = require('./routes/index');
const joinGameRouter = require('./routes/join');
const newGameRouter = require('./routes/new');
//const gameRouter = require('./routes/game');
const gameLocalRouter = require('./routes/gameLocal');
const gameOnlineRouter = require('./routes/gameOnline');

const lobbyCollection = require('./models/lobbyCollection');
const Game = require('./models/game');
const GameState = require('./models/gameState');

const app = express();

/*
const mongo_db_default_url = 'mongodb://localhost:27017/extavalon'
mongoose.connect(process.env.MONGO_URL || mongo_db_default_url);
mongoose.Promise = global.Promise;
*/

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const sessionMiddleware = expressSession({
  secret: 'extavalon',
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/join', joinGameRouter);
app.use('/new', newGameRouter);
app.use('/game-local', gameLocalRouter);
app.use('/game-online', gameOnlineRouter);
//app.use('/game', gameRouter);

app.createServer = function() {
  const server = http.createServer(app);
  const io = require('socket.io')(server);
  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });

  function closeLobby(lobby) {
    const code = lobby.code;
    lobbyCollection.lobbies.delete(code);
    io.sockets.to(code).emit('close-lobby');
  };

  setInterval(function() {
    var time = Date.now();
    for (let lobby of lobbyCollection.lobbies.values()) {
      if (lobby.updateTime < (time - 3600000)) {
        closeLobby(lobby);
      }
    }
  }, 600000);
  
  function updatePlayer(lobby, socket, name) {
    const sessionId = socket.request.session.id;
    const socketId = socket.id;
    lobby.playerCollection.updatePlayer(sessionId, socketId, name, true);
  
    if (lobby.game) {
      const currentPlayer = lobby.playerCollection.getPlayerOfSessionId(sessionId);
      if (lobby.type === 'online') {
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
            if (!currentProposal.hasVoted(currentPlayer.id)) {
              sendVoteTeam(socketId);
            } else {
              sendStatusMessage("Voting on team...", socketId);
            }
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
            sendStatusMessage(`${assassin.name} is choosing who to assassinate...`, socketId);
            break;
          case GameState.PHASE_DONE:
            sendGameResult(lobby, socketId);
            break;
        }
      } else {
        sendStartLocalGame(lobby.game, currentPlayer);
      }
    }
  }

  function sendUpdatePlayers(lobby, receiver) {
    io.sockets.to(receiver).emit('update-players', lobby.playerCollection.getLobbyPlayers());
  }

  function handleDisconnect(lobby, sessionId) {
    lobby.playerCollection.deactivatePlayer(sessionId);
    sendUpdatePlayers(lobby, lobby.code);
  }

  function startLocalGame(lobby) {
    const activePlayers = lobby.playerCollection.getActivePlayers();
    const game = new Game(activePlayers.map(({name}) => ({name})), lobby.settings);
    lobby.game = game;
    for (var i = 0; i < activePlayers.length; i++) {
      const currentPlayer = activePlayers[i];
      //lobby.playerCollection.updatePlayerIdBySessionId(currentPlayer.sessionId, i);
      lobby.playerCollection.updatePlayerIdBySocketId(currentPlayer.socketId, i);
      sendStartLocalGame(lobby.game, currentPlayer);
    }
  }

  function startOnlineGame(lobby) {
    const activePlayers = lobby.playerCollection.getActivePlayers();
    const game = new Game(activePlayers.map(({name}) => ({name})), lobby.settings);
    lobby.game = game;
    lobby.lastGunSlots = null;
    for (var i = 0; i < activePlayers.length; i++) {
      const currentPlayer = activePlayers[i];
      //lobby.playerCollection.updatePlayerIdBySessionId(currentPlayer.sessionId, i);
      lobby.playerCollection.updatePlayerIdBySocketId(currentPlayer.socketId, i);
      sendStartOnlineGame(lobby.game, currentPlayer);
    }
    startProposal(lobby);
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
    io.sockets.to(receiver).emit('update-leader', {previousLeaderId: previousLeaderId, leaderId: leader.id});
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
    io.sockets.to(receiver).emit('propose-team', {gunSlots: gunSlots});
  }

  function startProposal(lobby) {
    const leader = sendUpdateLeader(lobby.game, lobby.code);
    sendStatusMessage(`${leader.name} is proposing team...`, lobby.code);
    lobby.lastGunSlots = null;
    sendProposeTeam(lobby, lobby.playerCollection.getSocketIdOfPlayerId(leader.id));
  }

  function sendUpdateTeam(gunSlots, receiver) {
    if (gunSlots) {
      io.sockets.to(receiver).emit('update-team', {gunSlots: gunSlots});
    }
  }

  function updateTeam(lobby, gunSlots) {
    lobby.lastGunSlots = gunSlots;
    sendUpdateTeam(gunSlots, lobby.code)
  }

  function sendVoteTeam(receiver) {
    io.sockets.to(receiver).emit('vote-team');
  }

  function proposeTeam(lobby, selectedIds) {
    lobby.game.createProposal(selectedIds);
    sendVoteTeam(lobby.code);
  }

  function sendVoteResult(lobby, receiver) {
    const voteResult = lobby.game.getProposalResult();
    if (voteResult) {
      io.sockets.to(receiver).emit('vote-result', {votes: Object.fromEntries(voteResult.votes), approved: voteResult.approved});
    }
  }

  function sendReact(receiver) {
    io.sockets.to(receiver).emit('react');
  }

  function processVoteTeam(lobby, sessionId, vote) {
    const playerId = lobby.playerCollection.getPlayerIdOfSessionId(sessionId);
    if (lobby.game.addProposalVote(playerId, vote)) {
      sendVoteResult(lobby, lobby.code);
      if (lobby.game.getCurrentPhase() !== GameState.PHASE_VOTE_REACT) {
        sendMissionResult(lobby, lobby.code, false);
        if (lobby.game.isGameOver()) {
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
    io.sockets.to(receiver.socketId).emit('conduct-mission', {failAllowed: failAllowed, reverseAllowed: reverseAllowed});
  }

  function sendStatusMessage(message, receiver) {
    io.sockets.to(receiver).emit('update-status', {message: message});
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
      io.sockets.to(receiver).emit('mission-result', {result: missionResult, showActions: showActions});
    }
  }

  function processMissionAction(lobby, sessionId, action) {
    const playerId = lobby.playerCollection.getPlayerIdOfSessionId(sessionId);
    if (lobby.game.addMissionAction(playerId, action)) {
      sendMissionResult(lobby, lobby.code, true);
      if (lobby.game.getCurrentPhase() === GameState.PHASE_ASSASSINATION) {
        const assassin = lobby.playerCollection.getPlayerOfPlayerId(lobby.game.state.assassinId);
        sendConductAssassination(assassin.socketId);
        sendStatusMessage(`${assassin.name} is choosing who to assassinate...`, lobby.code);
      } else if (lobby.game.isGameOver()) {
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
      io.sockets.to(receiver).emit('game-result', {winner: gameResult.winner, message: gameResult.message});
    }
  }

  function handleAssassination(lobby, ids, role) {
    lobby.game.processAssassinationAttempt(ids, role);
    sendGameResult(lobby, lobby.code);
  }

  io.on('connection', socket => {
    const code = socket.handshake.query.code;
    const name = socket.handshake.query.name;
    const sessionId = socket.request.session.id;

    const lobby = lobbyCollection.lobbies.get(code);
    if (lobby) {
      lobby.updateTime = Date.now();
      //if (!lobby.playerCollection.doesSessionIdExist(socket.request.session.id)) {
      if (!lobby.playerCollection.doesSocketIdExist(socket.id)) {
        lobby.playerCollection.addPlayer(socket, name);
      } else {
        updatePlayer(lobby, socket, name);
      }
      socket.join(code);

      sendUpdatePlayers(lobby, lobby.code);

      socket.on('start-game-local', () => {
        lobby.updateTime = Date.now();
        startLocalGame(lobby);
      });

      socket.on('start-game-online', () => {
        lobby.updateTime = Date.now();
        startOnlineGame(lobby);
      });

      socket.on('update-team', ({gunSlots}) => {
        lobby.updateTime = Date.now();
        updateTeam(lobby, gunSlots);
      });

      socket.on('propose-team', ({selectedIds}) => {
        lobby.updateTime = Date.now();
        proposeTeam(lobby, selectedIds);
      });

      socket.on('vote-team', ({vote}) => {
        lobby.updateTime = Date.now();
        processVoteTeam(lobby, sessionId, vote);
      });

      socket.on('conduct-mission', ({action}) => {
        lobby.updateTime = Date.now();
        processMissionAction(lobby, sessionId, action);
      });

      socket.on('advance-mission', () => {
        lobby.updateTime = Date.now();
        advanceMission(lobby);
      });

      socket.on('conduct-assassination', ({ids, role}) => {
        lobby.updateTime = Date.now();
        handleAssassination(lobby, ids, role);
      });

      socket.on('close-lobby', () => {
        closeLobby(lobby);
      });

      socket.on('disconnect', () => {
        lobby.updateTime = Date.now();
        handleDisconnect(lobby, sessionId);
      });
    }
  });
  return server;
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});

module.exports = app;
