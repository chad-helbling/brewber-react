import { Router } from 'express';
const router = Router();

import { getTemperature } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        const temperature = getTemperature();
        res.send({ temperature });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
