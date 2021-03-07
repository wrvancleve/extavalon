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

  io.on('connection', socket => {
    function createNewPlayer(lobby, name) {
      const newPlayer = {
        sessionId: socket.request.session.id,
        socketId: socket.id,
        name: name,
        active: true
      };
      lobby.players.push(newPlayer);
    }
    
    function updatePlayer(lobby, currentPlayer, name) {
      currentPlayer.socketId = socket.id;
      currentPlayer.name = name;
      currentPlayer.active = true;
    
      if ('game' in lobby) {
        lobby.socketsByPlayerId.set(currentPlayer.id, currentPlayer.socketId);
        io.sockets.to(currentPlayer.socketId).emit('start-game', lobby.game.getPlayerHTML(currentPlayer.id));
      }
    }

    function handleDisconnect(lobby) {
      const disconnectingPlayerIndex = lobby.players.findIndex(player => player.socketId === socket.id);
      if (disconnectingPlayerIndex > 0) {
        lobby.players[disconnectingPlayerIndex].active = false;
        io.sockets.to(lobby.code).emit('update-players',
          lobby.players.map(({ name, active }) => ({name, active})));
      } else {
        closeLobby(lobby);
      }
    }

    function closeLobby(lobby) {
      const code = lobby.code;
      lobbyCollection.lobbies.delete(code);
      io.sockets.to(code).emit('close-lobby');
    };

    function startLocalGame(lobby) {
      const activePlayers = lobby.players.filter(player => player.active);
      const game = new Game(activePlayers.map(({name}) => ({name})), lobby.settings);
      lobby.game = game;
      for (var i = 0; i < activePlayers.length; i++) {
        const currentPlayer = activePlayers[i];
        currentPlayer.id = i;
        lobby.socketsByPlayerId.set(i, currentPlayer.socketId);
        io.sockets.to(currentPlayer.socketId).emit('start-game', {
          gameHTML: game.getPlayerHTML(i),
          amFirstPlayer: game.isCurrentLeader(i)
        });
      }
    }

    function startOnlineGame(lobby) {
      const activePlayers = lobby.players.filter(player => player.active);
      const game = new Game(activePlayers.map(({name}) => ({name})), lobby.settings);
      lobby.game = game;
      for (var i = 0; i < activePlayers.length; i++) {
        const currentPlayer = activePlayers[i];
        currentPlayer.id = i;
        lobby.socketsByPlayerId.set(i, currentPlayer.socketId);
        io.sockets.to(currentPlayer.socketId).emit('start-game', {
          gameHTML: game.getPlayerHTML(i),
          players: game.getPlayerInformation(i),
          id: i
        });
      }
      startProposal(lobby);
    }

    function startProposal(lobby) {
      const leader = lobby.game.getCurrentLeader().getPlayerObject();
      const previousLeaderId = lobby.game.getPreviousLeader().id;
      const mission = lobby.game.getCurrentMission();
      io.sockets.to(lobby.code).emit('update-leader', {previousLeaderId: previousLeaderId, leader: leader});
      io.sockets.to(lobby.socketsByPlayerId.get(leader.id)).emit('propose-team', {count: mission.teamSize});
    }

    function updateTeam(lobby, selectedIds) {
      io.sockets.to(lobby.code).emit('update-team', {selectedIds: selectedIds});
    }

    function proposeTeam(lobby, selectedIds) {
      lobby.game.createProposal(selectedIds);
      io.sockets.to(lobby.code).emit('vote-team');
    }

    function voteTeam(lobby, id, vote) {
      const result = lobby.game.addProposalVote(id, vote);
      if (result !== null) {
        io.sockets.to(lobby.code).emit('vote-result', {votes: Object.fromEntries(result.votes), approved: result.approved});
        if (result.gameOver) {
          io.sockets.to(lobby.code).emit('game-result', {result: "Spies"});
        } else {
          lobby.playersReady = 0;
          if (result.advanceMission) {
            io.sockets.to(lobby.code).emit('update-status', {result: "Mission failed!"});
          }
        }
      }
    }

    function advanceMission(lobby) {
      lobby.playersReady += 1;
      if (lobby.playersReady === lobby.socketsByPlayerId.size) {
        lobby.playersReady = 0;
        if (lobby.game.advance() === GameState.PHASE_PROPOSE) {
          startProposal(lobby);
        } else {
          conductMission(lobby);
        }
      }
    }

    function conductMission(lobby) {
      const missionTeam = lobby.game.getCurrentProposal().team;
      for (let i = 0; i < missionTeam.length; i++) {
        const id = missionTeam[i];
        const playerRole = lobby.game.getPlayer(id).role;
        const playerTeam = lobby.game.getPlayer(id).team;
        const failAllowed = playerTeam === "Spies" || playerRole === "Puck";
        const reverseAllowed = playerRole === "Lancelot" || playerRole === "Maelagant";
        io.sockets.to(lobby.socketsByPlayerId.get(id)).emit('conduct-mission', {failAllowed: failAllowed, reverseAllowed: reverseAllowed});
        io.sockets.to(lobby.code).emit('update-status', {message: "Conducting mission..."});
      }
    }

    function processMissionAction(lobby, id, action) {
      const result = lobby.game.addMissionAction(id, action);
      if (result !== null) {
        io.sockets.to(lobby.code).emit('mission-result', {result: result});
        if (result.gameOver) {
          const winner = result.result === 'Success' ? 'Resistance' : 'Spies';
          io.sockets.to(lobby.code).emit('game-result', {result: winner});
        } else {
          lobby.playersReady = 0;
        }
      }
    }

    socket.on('join-lobby', ({name, code}) => {
      const lobby = lobbyCollection.lobbies.get(code);
      //const connectingPlayerIndex = lobby.players.findIndex(player => player.sessionId === socket.request.session.id);
      const connectingPlayerIndex = lobby.players.findIndex(player => player.socketId === socket.id);
      if (connectingPlayerIndex === -1) {
        createNewPlayer(lobby, name);
      } else {
        updatePlayer(lobby, lobby.players[connectingPlayerIndex], name);
      }
      socket.join(code);

      io.sockets.to(code).emit('update-players',
        lobby.players.map(({ name, active }) => ({name, active})));

      socket.on('start-game-local', () => {
        startLocalGame(lobby);
      });

      socket.on('start-game-online', () => {
        startOnlineGame(lobby);
      });

      socket.on('update-team', ({selectedIds}) => {
        updateTeam(lobby, selectedIds);
      });

      socket.on('propose-team', ({selectedIds}) => {
        proposeTeam(lobby, selectedIds);
      });

      socket.on('vote-team', ({id, vote}) => {
        voteTeam(lobby, id, vote);
      });

      socket.on('conduct-mission', ({id, action}) => {
        processMissionAction(lobby, id, action);
      });

      socket.on('advance-mission', () => {
        advanceMission(lobby);
      });

      socket.on('close-lobby', () => {
        closeLobby(lobby);
      });

      socket.on('disconnect', () => {
        handleDisconnect(lobby);
      });
    });
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
