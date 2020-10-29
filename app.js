require('dotenv').config({ path: `${__dirname}/.env` })

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const expressSession = require('express-session');
const mongoose = require('mongoose');
const http = require('http');

const indexRouter = require('./routes/index');
const joinGameRouter = require('./routes/join');
const newGameRouter = require('./routes/new');
const gameRouter = require('./routes/game');

const Lobby = require('./models/lobby');
const Game = require('./models/game');

const app = express();

const mongo_db_default_url = 'mongodb://localhost:27017/extavalon'
mongoose.connect(process.env.MONGO_URL || mongo_db_default_url);
mongoose.Promise = global.Promise;

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
app.use('/game', gameRouter);

app.createServer = function() {
  const server = http.createServer(app);
  const io = require('socket.io')(server);
  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });

  io.on('connection', socket => {
    socket.on('join-lobby', ({name, code}) => {
      Lobby.findOne({ "code": code }).then(function(existingLobby) {
        const connectingPlayerIndex = existingLobby.players.findIndex(player => player.session_id == socket.request.session.id)
        if (connectingPlayerIndex == -1) {
          const newPlayer = {
            sessionId: socket.request.session.id,
            socketId: socket.id,
            name: name
          };
          existingLobby.players.push(newPlayer);

          // Send updated player list to host
          io.sockets.to(existingLobby.players[0].socketId).emit('update-players',
              existingLobby.players.map(player => player.name));
        } else {
          // Update socket id
          existingLobby.players[connectingPlayerIndex] = socket.id;
        }
        existingLobby.save();
        socket.join(code);

        socket.on('start-game', () => {
          // Create game and send data back
          Lobby.findOne({ "code": code }).then(function(existingLobby) {
            if (existingLobby.status != 'STARTED') {
              existingLobby.status = 'STARTED'
              existingLobby.save();
            }

            const game = new Game(existingLobby.players, existingLobby.settings);
            for (var i = 0; i < existingLobby.players.length; i++) {
              const currentPlayer = existingLobby.players[i];
              io.sockets.to(currentPlayer.socketId).emit('start-game', game.getPlayerHTML(i));
            }
          });
        });

        function closeLobby() {
          Lobby.deleteOne({"code": code}, function (err, result) {
            io.sockets.to(code).emit('close-lobby');
          });
        };

        socket.on('close-lobby', closeLobby);

        socket.on('disconnect', () => {
          Lobby.findOne({ "code": code }).then(function(existingLobby) {
            if (existingLobby) {
              const disconnectingPlayerIndex = existingLobby.players.findIndex(player => player.socketId == socket.id);
              if (disconnectingPlayerIndex > 0) {
                existingLobby.players.splice(disconnectingPlayerIndex, 1);
                existingLobby.save();
                io.sockets.to(existingLobby.players[0].socketId).emit('update-players',
                    existingLobby.players.map(player => player.name));
              } else {
                closeLobby();
              }
            }
          });
        });
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
