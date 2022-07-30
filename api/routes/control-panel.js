import { Router } from 'express';
const router = Router();

import { getControlState } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        const controlState = getControlState();
        res.send({ controlState });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
