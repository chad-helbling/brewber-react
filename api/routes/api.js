import temperature from './temperature.js';
import pumpRelay from './pump-relay.js';
import rimsRelay from './rims-relay.js';
import autoMash from './auto-mash.js';

export default function (app) {
    app.get('/', (req, res) => {
        res.send('api works');
    });

    app.use('/temperature', temperature);
    app.use('/pump-relay', pumpRelay);
    app.use('/rims-relay', rimsRelay);
    app.use('/auto-mash', autoMash);
}
