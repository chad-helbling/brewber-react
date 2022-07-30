// Get dependencies
import express from 'express';
import { join } from 'path';
import { createServer } from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
const { json, urlencoded } = bodyParser;
import { setupArduino } from './components/arduino-interface.js';
import api from './routes/api.js';

//setup arduino
setupArduino();

const app = express();

// Add headers
app.use((req, res, next) => {
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200, *.ngrok.io');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(cors());

// Parsers for POST data
app.use(json());
app.use(urlencoded({ extended: false }));

// Point static path to dist
// app.use(express.static(join(__dirname, 'dist')));

// Set our api routes
// Set our api routes
api(app);

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '8080';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
