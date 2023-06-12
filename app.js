require('dotenv').config({ path: `${__dirname}/.env` })

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const http = require('http');
const sassMiddleware = require('node-sass-middleware');
const cors = require('cors')

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const profileRouter = require('./routes/profile');
const statsRouter = require('./routes/stats');
const gameRouter = require('./routes/game');

const ROOT_URL = process.env.ROOT_URL;

const createGameServer = require('./models/gameServer');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const sessionMiddlewareOptions = {
  secret: 'extavalon',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false
  }
};

app.use(cors({
  origin: ROOT_URL
}));
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionMiddlewareOptions.cookie.secure = true;
}
const sessionMiddleware = expressSession(sessionMiddlewareOptions);
app.set('trust proxy', 1);
app.use(sessionMiddleware);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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

process.on('uncaughtException', function(err) {
  process.exit();
});

module.exports = app;
