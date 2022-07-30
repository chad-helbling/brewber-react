// todo - this might work better as a class

import JohnnyFive from 'johnny-five';
const { Board, Thermometer, Relay } = JohnnyFive;
import { setTimeout } from 'timers/promises';

let board = {};
let mashThermometer = {};
let rimsThermometer = {};
let pumpRelay = {};
let rimsRelay = {};

const TEMPERATURE_PROBE_PIN = 3;
const TEMPERATURE_PROBE_CONTROLLER = 'DS18B20';
const MASH_THERMOMETER_ADDRESS = 89666443;
const RIMS_THERMOMETER_ADDRESS = 819848;
const RIMS_RELAY_PIN = 9;
const PUMP_RELAY_PIN = 10;
const AUTO_CIRCULATE_INTERVAL = 1000 * 60 * 5; // 5 mins

const mashState = {
    targetTemperature: 150,
    mashTemperature: 0,
    rimsTemperature: 0,
};

const controlState = {
    pump: false,
    pumpStartTime: 0,
    pumpEndTime: 0,
    rims: false,
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
        if (pumpRelayExists && controlState.pump) {
            console.log('turning pump relay off');
            pumpRelay.open();
        }

        const rimsRelayExists = Object.keys(rimsRelay).length;
        if (rimsRelayExists && controlState.rims) {
            console.log('turning rims relay off');
            rims.open();
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
        // console.log('mash', temperatureData);
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
        // console.log('rims', temperatureData);
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

    controlState.pump = !pump;

    if (pump) {
        controlState.pumpEndTime = Date.now();
    }

    controlState.pumpStartTime = Date.now();
    pumpRelay.toggle();
}

export function toggleRimsRelay() {
    const { rims } = controlState;

    if (!Object.keys(rimsRelay).length) {
        console.error('rimsRelay not setup');
        return;
    }

    controlState.rims = !rims;

    rimsRelay.toggle();
}

function autoCirculate() {
    const { pump, pumpStartTime, pumpEndTime } = controlState;

    const now = Date.now();
    const millisSinceStart = now - pumpStartTime;
    const millisSinceEnd = now - pumpEndTime;

    const shouldTurnOffPump = pump && millisSinceStart > AUTO_CIRCULATE_INTERVAL;
    const shouldTurnOnPump = !pump && millisSinceEnd > AUTO_CIRCULATE_INTERVAL;

    if (shouldTurnOffPump || shouldTurnOnPump) {
        return togglePumpRelay();
    }
}

async function shutdownAutoMash() {
    const { rims, pump } = controlState;

    if (rims) {
        toggleRimsRelay();
    }

    if (pump) {
        // todo maybe restart autoCirculate logic instead??
        await setTimeout(10000);
        togglePumpRelay();
    }
}

async function runAutoMash() {
    const { targetTemperature, mashTemperature } = mashState;
    const { autoMash, rims, pump } = controlState;

    if (!autoMash) {
        await shutdownAutoMash();
        return;
    }

    const roundedMashTemp = Math.round(mashTemperature);
    const shouldRunRIMS = roundedMashTemp < targetTemperature;

    // console.log(JSON.stringify(controlState));
    // console.log(`roundedMashTemp = ${roundedMashTemp}`);
    // console.log(`targetTemperature = ${targetTemperature}`);
    // console.log(`shouldRunRIMS = ${shouldRunRIMS}`);

    // shut off rims if we're at the target temp
    if (!shouldRunRIMS && rims) {
        toggleRimsRelay();
    }

    if (shouldRunRIMS && !rims) {
        if (!pump) togglePumpRelay();

        // let pump run for 10 secs before turning on rims to avoid scorching
        await setTimeout(10000);

        toggleRimsRelay();
    }

    // dont need to run rims so run circulation logic so pump still runs every so often
    if (!shouldRunRIMS && !rims) {
        autoCirculate();
    }

    // if (shouldRunRims && rims) --> keep on keeping on

    await setTimeout(1000);
    runAutoMash();
}

export async function toggleAutoMash() {
    // todo make this better
    const { autoMash } = controlState;
    controlState.autoMash = !autoMash;

    if (controlState.autoMash) {
        await runAutoMash();
        return;
    }
}

export function getTemperatureState() {
    return mashState;
}

export function setTemperatureState(targetTemperature) {
    mashState.targetTemperature = targetTemperature;
}

export function getControlState() {
    return controlState;
}
