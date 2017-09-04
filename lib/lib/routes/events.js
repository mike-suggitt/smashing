
var express = require('express');
var router = express.Router();
var eventService = require('../eventservice');

router.get('*', function (req, res) {
    try {
        eventService.addConnection(req, res);
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;