import { Board, Thermometer, Relay } from 'johnny-five';
import { setTimeout } from 'timers/promises';

let board = {};
let mashThermometer = {};
let rimsThermometer = {};
let pumpRelay = {};
let rimsRelay = {};
let temperature = 0;
let mashTemperature = 0;

const TEMPERATURE_PROBE_PIN = 3;
const TEMPERATURE_PROBE_CONTROLLER = 'DS18B20';
const MASH_THERMOMETER_ADDRESS = 89666443;
const RIMS_THERMOMETER_ADDRESS = 819848;
const RIMS_RELAY_PIN = 9;
const PUMP_RELAY_PIN = 10;

const mashState = {
    targetTemperature: 0,
    mashTemperature: 0,
    rimsTemperature: 0,
};

const controlState = {
    pump: pumpRelay.isOn(),
    pumpStartTime: 0,
    pumpEndTime: 0,
    rims: rimsRelay.isOn(),
    autoMash: false,
};

export function setupArduino() {
    board = new Board({
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
}

function setupThermometer() {
    console.log('setting up thermometer...');
    // This requires OneWire support using the ConfigurableFirmata
    mashThermometer = new Thermometer({
        controller: TEMPERATURE_PROBE_CONTROLLER,
        pin: TEMPERATURE_PROBE_PIN,
        address: MASH_THERMOMETER_ADDRESS,
    });
    console.log('done setting up mash thermometer...');

    mashThermometer.on('change', (temperatureData) => {
        console.log('mash', temperatureData);
        // console.log(`Thermometer B at address: 0x${address.toString(16)}`);
        mashState.mashTemperature = (temperatureData && temperatureData.fahrenheit) || 0;
    });

    rimsThermometer = new Thermometer({
        controller: TEMPERATURE_PROBE_CONTROLLER,
        pin: TEMPERATURE_PROBE_PIN,
        address: RIMS_THERMOMETER_ADDRESS,
    });
    console.log('done setting up rims thermometer...');

    rimsThermometer.on('change', (temperatureData) => {
        console.log('rims', temperatureData);
        // console.log(`Thermometer B at address: 0x${address.toString(16)}`);
        mashState.rimsTemperature = (temperatureData && temperatureData.fahrenheit) || 0;
    });
}

function setupPumpRelay() {
    console.log('setting up pump relay...');
    pumpRelay = new Relay(PUMP_RELAY_PIN);
    console.log('done setting up pump relay...');
}

function setupRIMSRelay() {
    console.log('setting up RIMS relay...');
    rimsRelay = new Relay(RIMS_RELAY_PIN);
    console.log('done setting up RIMS relay...');
}

export function togglePumpRelay() {
    const { pump } = controlState;

    if (!Object.keys(pumpRelay).length) {
        console.error('pumpRelay not setup');
        return;
    }

    if (pump) {
        controlState.pumpEndTime = Date.now();
    }

    controlState.pumpStartTime = Date.now();
    pumpRelay.toggle();
}

export function toggleRimsRelay() {
    if (!Object.keys(rimsRelay).length) {
        console.error('rimsRelay not setup');
        return;
    }

    rimsRelay.toggle();
}

function autoCirculate() {
    const { pump, pumpStartTime, pumpEndTime } = controlState;

    const now = Date.now();
    const fiveMinutes = 1000 * 60 * 5;
    const millisSinceStart = now - pumpStartTime;
    const millisSinceEnd = now - pumpEndTime;

    const shouldTurnOffPump = pump && millisSinceStart > fiveMinutes;
    const shouldTurnOnPump = !pump && millisSinceEnd > fiveMinutes;

    if (shouldTurnOffPump || shouldTurnOnPump) {
        return togglePumpRelay();
    }
}

async function autoMash() {
    let intervalInProgress = false;

    async function runAutoMash() {
        // make sure we dont stack interval runs
        if (intervalInProgress) return;
        intervalInProgress = true;

        const { targetTemperature, mashTemperature } = mashState;
        const { rims, pump } = controlState;

        const roundedMashTemp = Math.round(mashTemperature);
        const shouldRunRIMS = roundedMashTemp < targetTemperature;

        // dont need to run rims so run circulation logic so pump still runs every so often
        if (!shouldRunRIMS) autoCirculate();

        // shut off rims if we're at the target temp
        if (!shouldRunRIMS && rims) toggleRimsRelay();

        if (shouldRunRIMS && !rims) {
            if (!pump) togglePumpRelay();

            // let pump run for 10 secs before turning on rims to avoid scorching
            await setTimeout(10000);

            toggleRimsRelay();

            intervalInProgress = false;
            return;
        }

        // if (shouldRunRims && rims) --> keep on keeping on

        intervalInProgress = false;
    }

    setInterval(runAutoMash, 1000);
}

export async function toggleAutoMash() {
    const { autoMash } = controlState;
    controlState.autoMash = !autoMash;
}

export function getTemperatureState() {
    return mashState;
}

export function getControlState() {
    return {
        pumpRelay: pumpRelay.isOn(),
        rimsRelay: rimsRelay.isOn(),
        autoMash: false,
    };
}
