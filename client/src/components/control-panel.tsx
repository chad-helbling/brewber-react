import { useState } from 'react';
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


  async function sendPumpToggle(active: boolean) {
    const pumpRelayResult = await Axios.get('http://localhost:8080/pump-relay');
    const { data } = pumpRelayResult;


    if (data.success === 'false') {
      console.error('error toggling pump relay');
      return;
    }

    setPumpToggle(active)
  }

  async function sendRimsToggle(active: boolean) {
    // const pumpRelayResult = await Axios.get('http://localhost:8080/pump-relay');
    // const { data } = pumpRelayResult;


    // if (data.success === 'false') {
    //   console.error('error toggling pump relay');
    //   return;
    // }

    setRimsToggle(active)
  }





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
              value={mashTemp}
              onChange={updateMashTemp}
              id="mashtemp"
            />
          </label>
          <ToggleButton onChange={toggleTrackTemperature} buttonState={trackTemperature} buttonLabel="Track Temperature" />
          <ToggleButton onChange={sendPumpToggle} buttonState={pumpToggle} buttonLabel="Pump" />
          <ToggleButton onChange={sendRimsToggle} buttonState={rimsToggle} buttonLabel="RIMS" />
        </div>
      </form>
    </div>
  );
}
