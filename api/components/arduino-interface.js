const five = require('johnny-five');

let board = {};
let thermometer = {};
let pumpRelay = {};
let rimsRelay = {};
let temperature = 0;

const TEMPERATURE_PROBE_PIN = 3;
const TEMPERATURE_PROBE_CONTROLLER = 'DS18B20';
const RIMS_RELAY_PIN = 9;
const PUMP_RELAY_PIN = 10;

const setupArduino = () => {
    board = new five.Board({
        repl: false,
    });
    board.on('ready', () => {
        console.log('board ready');
        setupThermometer();
        setupPumpRelay();
        setupRIMSRelay();
    });
    board.on('exit', () => {
        const pumpRelayExists = Object.keys(pumpRelay).length;
        if (pumpRelayExists && pumpRelay.isOn) {
            console.log('turning pump relay off');
            pumpRelay.open();
        }
    });
};

const setupThermometer = () => {
    console.log('setting up thermometer...');
    // This requires OneWire support using the ConfigurableFirmata
    thermometer = new five.Thermometer({
        controller: TEMPERATURE_PROBE_CONTROLLER,
        pin: TEMPERATURE_PROBE_PIN,
    });
    console.log('done setting up thermometer...');

    thermometer.on('change', (temperatureData) => {
        // console.log(temperatureData)
        temperature = (temperatureData && temperatureData.fahrenheit) || 0;
    });
};

const setupPumpRelay = () => {
    console.log('setting up pump relay...');
    pumpRelay = new five.Relay(PUMP_RELAY_PIN);
    console.log('done setting up pump relay...');
};

const setupRIMSRelay = () => {
    console.log('setting up RIMS relay...');
    rimsRelay = new five.Relay(RIMS_RELAY_PIN);
    console.log('done setting up RIMS relay...');
};

const getTemperature = () => temperature;

function togglePumpRelay() {
    if (!Object.keys(pumpRelay).length) {
        console.error('pumpRelay not setup');
        return;
    }

    pumpRelay.toggle();
}

module.exports = {
    setupArduino,
    getTemperature,
    togglePumpRelay,
};
