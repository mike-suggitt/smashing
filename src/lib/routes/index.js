const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const events = require('./events');

router.use('/events', events);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get(/^\/(.+)/, function (req, res) {
    const dashboard = req.params[0];
    if(dashboard !== 'favicon.ico') {
        fs.exists([path.join(process.cwd(), 'dashboards'), dashboard + '.hbs'].join(path.sep), function (exists) {
            if (exists) {
                res.render(dashboard, {
                    dashboard: dashboard,
                    request: req
                });
            } else {
                res.status(404).end();
            }
        });
    }
});

module.exports = router;