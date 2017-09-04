const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

const events = require('./events');

router.use('/events', events);



/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('index');
    res.render('index', { title: 'Express' });
});


router.get(/^\/(.+)/, function (req, res) {
    var dashboard = req.params[0];
    if(dashboard !== 'favicon.ico') {
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
    // res.render('index', { title: 'Express' });
});



module.exports = router;