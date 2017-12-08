var hbs = require('hbs');
var fs = require('fs');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mincer = require("./mincer");
var http = require('http');
var routes = require('./routes/index');
var eventService = require('./eventService');
var loader = require('./loader');

var smashing = {};
smashing.app = express();
smashing.eventService = eventService;
smashing.app.set('views', path.join(process.cwd(), 'dashboards'));
smashing.app.set('view engine', 'hbs');

smashing.app.use(logger('dev'));
smashing.app.use(bodyParser.json());
smashing.app.use(bodyParser.urlencoded({ extended: false }));
// smashing.app.use(cookieParser());
// smashing.app.use('/events', events);
smashing.app.use(express.static(path.join(__dirname, 'public')));

mincer(smashing);

smashing.mincer.environment.appendPath(path.resolve(__dirname, 'assets/javascripts'));
smashing.mincer.environment.appendPath(path.resolve(__dirname, 'assets/stylesheets'));
smashing.mincer.environment.appendPath(path.resolve(__dirname, 'assets/html'));
smashing.mincer.environment.appendPath(path.resolve(__dirname, 'assets/fonts'));
smashing.mincer.environment.appendPath(path.resolve(__dirname, 'assets/images'));

smashing.load = loader.load;

smashing.start = function () {
    smashing.app.set('port', 3000);
    smashing.mincer.start();
    smashing.app.use(smashing.mincer.assets_prefix, smashing.mincer.server);
    smashing.app.use(routes);
    var server = http.createServer(smashing.app);
    server.listen(3000);
};

module.exports = smashing;