const express = require('express');
const router = express.Router();

const { getTemperature } = require('../components/arduino-interface');

router.get('/', (req, res) => {
    try {
        const temperature = getTemperature();
        res.send({ temperature });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;
