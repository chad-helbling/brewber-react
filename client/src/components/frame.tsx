import { TemperatureGraph } from './temperature-graph';
import BreweryIcon from './ui-components/brewery-icon';
import ControlPanel from './control-panel';
import { useState } from 'react';
import Axios from 'axios';

export default function Frame() {
    const [targetMashTemp, setTargetMashTemp] = useState('150');
    const [trackTemperature, setTrackTemperature] = useState(true);

    async function sendMashTemp(targetMashTemp: string) {
        await Axios.post('http://localhost:8080/temperature/set-mash-temp', { targetMashTemp });
        setTargetMashTemp(targetMashTemp);
    }

    return (
        <div className="bg-gray-600 bg-clip-border border-4 h-screen w-screen overflow-auto">
            <header className="flex flex-row flex-nowrap bg-gray-700 m-6 p-6 rounded shadow-lg">
                <BreweryIcon />
                <h1 className="text-white text-3xl ml-5 mt-5 font-mono">Brewber</h1>
            </header>

            <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-3 gap-1">
                <div className="flex col-span-2 row-span-1 bg-gray-200 m-6 p-2 rounded shadow-lg">
                    <TemperatureGraph targetMashTemp={targetMashTemp} trackTemperature={trackTemperature} />
                </div>
                <div className="flex justify-evenly col-span- bg-gray-200 m-6 p-2 rounded shadow-lg">
                    <ControlPanel
                        mashTemp={targetMashTemp}
                        updateMashTemp={(event: any) => sendMashTemp(event.target.value)}
                        trackTemperature={trackTemperature}
                        toggleTrackTemperature={(active: boolean) => {
                            setTrackTemperature(active);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
