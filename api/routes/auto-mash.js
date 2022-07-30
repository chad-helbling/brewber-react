import { Router } from 'express';
const router = Router();

import { toggleAutoMash } from '../components/arduino-interface.js';

router.get('/', (req, res) => {
    try {
        toggleAutoMash();
        res.send({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

export default router;
