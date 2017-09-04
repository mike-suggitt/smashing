
const express = require('express');
const router = express.Router();
const eventService = require('../eventservice');


router.get('*', function (req, res) {
    try {
        eventService.addConnection(req,res);
    }
    catch(e) {
        console.log(e);
    }
});




module.exports = router;


