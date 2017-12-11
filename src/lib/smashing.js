const hbs = require('hbs');
const fs = require('fs');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mincer = require("./mincer");
const http = require('http');
const routes = require('./routes/index');
const eventService = require('./eventservice');
const loader = require('./loader');

const smashing = {};
smashing.app = express();
smashing.eventService = eventService;
smashing.app.set('views', path.join(process.cwd(), 'dashboards'));
smashing.app.set('view engine', 'hbs');

smashing.app.use(logger('dev'));
smashing.app.use(bodyParser.json());
smashing.app.use(bodyParser.urlencoded({extended: false}));
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

smashing.start = function() {
    smashing.app.set('port', 3000);
    smashing.mincer.start();
    smashing.app.use(smashing.mincer.assets_prefix, smashing.mincer.server);
    smashing.app.use(routes);
    const server = http.createServer(smashing.app);
    server.listen(3000);
};

module.exports = smashing;
