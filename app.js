require('dotenv').config({ path: `${__dirname}/.env` })

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const http = require('http');
const sassMiddleware = require('node-sass-middleware');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const profileRouter = require('./routes/profile');
const statsRouter = require('./routes/stats');
const gameRouter = require('./routes/game');

const createGameServer = require('./models/gameServer');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const sessionMiddleware = expressSession({
  secret: 'extavalon',
  resave: false,
  saveUninitialized: false,
  secure: true
});

app.use(sessionMiddleware);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: __dirname + '/sass',
    dest: __dirname + '/public/stylesheets',
    prefix: '/stylesheets',
    debug: true,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/profile', profileRouter);
app.use('/stats', statsRouter);
app.use('/game', gameRouter);

app.createServer = function() {
  const server = http.createServer(app);
  createGameServer(server, sessionMiddleware);
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
  res.render('error', { title: 'Error', message: err });
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});

const fs = require('fs');
const util = require('util');

var log_file_err=fs.createWriteStream(__dirname + '/error.log',{flags:'a'});  

process.on('uncaughtException', function(err) {
  log_file_err.write(util.format('Caught exception: ' + err) + '\n');
  process.exit();
});

module.exports = app;
