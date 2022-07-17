import { Router } from 'express';
const router = Router();

import { togglePumpRelay } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        togglePumpRelay();
        res.send({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
