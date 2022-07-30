import { Router } from 'express';
const router = Router();

import { getTemperatureState, setTemperatureState } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        const temperatureState = getTemperatureState();
        res.send({ temperatureState });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post('/set-mash-temp', (req, res) => {
    try {
        const { body } = req;
        const { targetMashTemp } = body;

        setTemperatureState(targetMashTemp);
        res.send({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
