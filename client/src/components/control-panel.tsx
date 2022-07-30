import { useEffect, useState } from 'react';
import ToggleButton from './ui-components/toggle-button';
import Axios from 'axios';

interface ControlPanelProps {
    mashTemp: string;
    updateMashTemp: any;
    trackTemperature: boolean;
    toggleTrackTemperature: any;
}

export default function ControlPanel({
    mashTemp,
    updateMashTemp,
    trackTemperature,
    toggleTrackTemperature,
}: ControlPanelProps) {
    const [pumpToggle, setPumpToggle] = useState(false);
    const [rimsToggle, setRimsToggle] = useState(false);
    const [autoMashToggle, setAutoMashToggle] = useState(false);

    async function sendPumpToggle(active: boolean) {
        const pumpRelayResult = await Axios.get('http://localhost:8080/pump-relay');
        const { data } = pumpRelayResult;

        if (data.success === 'false') {
            console.error('error toggling pump relay');
            return;
        }

        setPumpToggle(active);
    }

    async function sendRimsToggle(active: boolean) {
        const rimsRelayResult = await Axios.get('http://localhost:8080/rims-relay');
        const { data } = rimsRelayResult;

        if (data.success === 'false') {
            console.error('error toggling rims relay');
            return;
        }

        setRimsToggle(active);
    }

    async function sendAutoMashToggle(active: boolean) {
        const autoMashResult = await Axios.get('http://localhost:8080/auto-mash');
        const { data } = autoMashResult;

        if (data.success === 'false') {
            console.error('error toggling auto mash');
            return;
        }

        setAutoMashToggle(active);
    }

    interface ControlPanelState {
        pump: boolean;
        rims: boolean;
        autoMash: boolean;
    }

    async function getControlState(): Promise<ControlPanelState> {
        const controlStateResult = await Axios.get('http://localhost:8080/control-panel');
        const { data } = controlStateResult;

        return data;
    }

    useEffect(() => {
        // get control state from server so we can have multiple clients
        // i.e. I want to use my phone too
        setInterval(async () => {
            const { pump, rims, autoMash } = await getControlState();

            if (pump) setPumpToggle(pump);
            if (rims) setRimsToggle(rims);
            if (autoMash) setAutoMashToggle(autoMash);
        }, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line jsx-a11y/alt-text
    return (
        <div>
            <h1 className="text-grey text-3xl m-5 font-mono">Control Panel</h1>
            <form>
                <div className="grid grid-rows-3 gap-4">
                    <label htmlFor="mashtemp">
                        <span className="pr-4">Mash Temp</span>
                        <input
                            type="text"
                            name="mashtemp"
                            defaultValue={mashTemp}
                            onBlur={updateMashTemp}
                            id="mashtemp"
                        />
                    </label>
                    <ToggleButton
                        onChange={toggleTrackTemperature}
                        buttonState={trackTemperature}
                        buttonLabel="Track Temperature"
                    />
                    <ToggleButton onChange={sendPumpToggle} buttonState={pumpToggle} buttonLabel="Pump" />
                    <ToggleButton onChange={sendRimsToggle} buttonState={rimsToggle} buttonLabel="RIMS" />
                    <ToggleButton onChange={sendAutoMashToggle} buttonState={autoMashToggle} buttonLabel="Auto Mash" />
                </div>
            </form>
        </div>
    );
}
