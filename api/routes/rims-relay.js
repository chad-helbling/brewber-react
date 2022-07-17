import { Router } from 'express';
const router = Router();

import { toggleRimsRelay } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        toggleRimsRelay();
        res.send({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
