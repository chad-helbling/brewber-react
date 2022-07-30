import { Router } from 'express';
const router = Router();

import { getTemperatureState, setTemperatureState } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        const temperature = getTemperatureState();
        res.send({ temperature });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post('/set-mash-temp', (req, res) => {
    try {
        const { body } = req;
        const { mashTemperature } = body;

        setTemperatureState(mashTemperature);
        res.send({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
