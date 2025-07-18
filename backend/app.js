var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

var connectDB = require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jointTypesRouter = require('./routes/joint-types');
var timeSlotsRouter = require('./routes/timeSlots');
var bookingsRouter = require('./routes/bookings');
var staffRouter = require('./routes/staff');

var app = express();

// Connect to database
connectDB();

// view engine setup (commented out for API-only server)
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS setup
app.use(cors());

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/joint-types', jointTypesRouter);
app.use('/api/hospitals', require('./routes/hospitals'));
// Joint capacities are handled by joint-types routes at /api/joint-types/capacities
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/time-slots', timeSlotsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/staff', staffRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send JSON error response for API
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
