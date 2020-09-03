var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var sendgrid = require('./routes/sendgrid'); // Email Calls to Server
var backend = require('./routes/backend'); // Verification Calls

var app = express();

app.use(require('prerender-node').set('prerenderToken', 'O5uEiI9uRn7lDc7yZcqP'));
// View Engine Not Requried
// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../dist/assets/favicon', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', index);
app.use('/sendgrid', sendgrid);
app.use('/backend', backend);
app.use(express.static(path.join(__dirname, '../dist')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;