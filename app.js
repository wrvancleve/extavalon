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
          amFirstPlayer: game.isFirstPlayer(i)
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
          players: game.getPlayerInformation(i)
        });
      }

      const firstLeader = game.getCurrentLeader().getPlayerObject();
      const firstMission = game.getCurrentMission();
      io.sockets.to(lobby.code).emit('update-leader', {leader: firstLeader});
      io.sockets.to(lobby.socketsByPlayerId.get(firstLeader.id)).emit('propose-team', {count: firstMission.teamSize});
    }

    function proposeTeam(lobby, selectedIds) {
      lobby.game.createProposal(selectedIds);
      const leader = lobby.game.getCurrentLeader().getPlayerObject();
      const team = lobby.game.getPlayersByIds(selectedIds);
      io.sockets.to(lobby.code).emit('vote-team', {leader: leader, team: team});
    }

    function advanceMission(lobby) {
      const currentLeader = lobby.game.getCurrentLeader().getPlayerObject();
      io.sockets.to(lobby.code).emit('update-leader', {leader: currentLeader});
      const currentMission = lobby.game.getCurrentMission();
      io.sockets.to(lobby.socketsByPlayerId.get(currentLeader.id)).emit('propose-team', {count: currentMission.teamSize});
    }

    function voteTeam(lobby, vote) {
      const currentPlayer = lobby.players.filter(player => player.socketId === socket.id)[0];
      const result = lobby.game.addProposalVote(currentPlayer.id, vote);
      if (result !== null) {
        if (result.approved) {
          io.sockets.to(lobby.code).emit('vote-result', {result: 'Approved'});
          for (let i = 0; i < result.proposal.team.length; i++) {
            const id = result.proposal.team[i];
            const playerRole = lobby.game.getPlayer(id).role;
            const playerTeam = lobby.game.getPlayer(id).team;
            const failAllowed = playerTeam === "Spies" || playerRole === "Puck";
            const reverseAllowed = playerRole === "Lancelot" || playerRole === "Maelagant";
            io.sockets.to(lobby.socketsByPlayerId.get(id)).emit('conduct-mission', {failAllowed: failAllowed, reverseAllowed: reverseAllowed});
          }
        } else if (result.gameOver) {
          console.log("Game Over");
        } else {
          io.sockets.to(lobby.code).emit('vote-result', {result: 'Rejected'});
          advanceMission(lobby);
        }
      }
    }

    function conductMission(lobby, action) {
      const currentPlayer = lobby.players.filter(player => player.socketId === socket.id)[0];
      const result = lobby.game.addMissionAction(currentPlayer.id, action);
      if (result !== null) {
        if (result.gameOver) {
          const winner = result.result === 'Success' ? 'Resistance' : 'Spies';
          io.sockets.to(lobby.code).emit('game-result', {result: winner});
        } else {
          io.sockets.to(lobby.code).emit('mission-result', {result: result.result});
          advanceMission(lobby);
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

      socket.on('propose-team', ({selectedIds}) => {
        proposeTeam(lobby, selectedIds);
      });

      socket.on('vote-team', ({vote}) => {
        voteTeam(lobby, vote);
      });

      socket.on('conduct-mission', ({action}) => {
        conductMission(lobby, action);
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
