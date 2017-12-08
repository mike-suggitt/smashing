var path = require('path');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var events = require('./events');

router.use('/events', events);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get(/^\/(.+)/, function (req, res) {
    var dashboard = req.params[0];
    if (dashboard !== 'favicon.ico') {
        fs.exists([path.join(process.cwd(), 'dashboards'), dashboard + '.hbs'].join(path.sep), function (exists) {
            if (exists) {
                res.render(dashboard, {
                    dashboard: dashboard,
                    request: req
                });
            } else {
                res.status(404).sendfile(dashing.public_folder + '/404.html');
            }
        });
    }
});

module.exports = router;