const temperature = require('./temperature.js');
const pumpRelay = require('./pump-relay.js')


module.exports = function(app) {
  /* GET api listing. */
  app.get('/', (req, res) => {
    res.send('api works');
  });


  app.use('/temperature', temperature);
  app.use('/pump-relay', pumpRelay);
};