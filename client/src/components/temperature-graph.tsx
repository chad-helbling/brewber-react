import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useEffect, useRef, useState } from 'react';
import { getTemperature } from './utils/api-interface';

ChartJS.register(...registerables);

export const options = {
    responsive: true,
};

export const data = {
    labels: ['initial'],
    datasets: [
        {
            label: 'Temperature',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            lineTension: 0.25,
        },
        {
            label: 'Target',
            data: [],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};

interface AddDataProps {
    chart: ChartJS;
    label: string;
    temperatureData: number;
    line: number;
    mashTemp: number;
}

function addData({ chart, label, temperatureData, line, mashTemp }: AddDataProps) {
    if (line === 0) {
        chart?.data?.labels?.push(label);
    }

    const temperatureDataSet = chart.data.datasets[line];
    const mashTempDataSet = chart.data.datasets[1];

    // set line color based on mashTemp
    if (temperatureData < mashTemp - 2) {
        temperatureDataSet.backgroundColor = '#007bff';
        temperatureDataSet.borderColor = '#007bff';
    } else if (mashTemp - 2 < temperatureData && temperatureData < mashTemp + 2) {
        temperatureDataSet.backgroundColor = '#008000';
        temperatureDataSet.borderColor = '	#008000';
    } else if (temperatureData > mashTemp + 2) {
        temperatureDataSet.backgroundColor = '#FF0000';
        temperatureDataSet.borderColor = '	#FF0000';
    }

    // set values
    temperatureDataSet.data.push(temperatureData);
    mashTempDataSet.data.push(mashTemp);

    chart.update();
}

interface TemperatureGraphProps {
    mashTemp: string;
    trackTemperature: boolean;
}

export function TemperatureGraph({ mashTemp, trackTemperature }: TemperatureGraphProps) {
    const [temperatureInterval, setTemperatureInterval] = useState(0);

    const chartRef = useRef<ChartJS>(null);

    // add line to target mash temp
    useEffect(() => {
        const chart = chartRef.current;
        const chartLabels = chart?.data?.labels || [];
        if (!chart) return;

        if (mashTemp) {
            chart.data.datasets[1].data = chartLabels.map(() => Number(mashTemp));
        }

        chart.update();
    }, [mashTemp]);

    useEffect(() => {
        if (!trackTemperature) {
            clearInterval(temperatureInterval);
            return;
        }

        // get temperature data and to chart on interval
        const intervalId: ReturnType<typeof setTimeout> = setInterval(async () => {
            const chart = chartRef.current;
            if (!chart) return;

            const temperatureResult = await getTemperature();
            const { temperature } = temperatureResult.data;

            addData({
                chart,
                label: `${temperature}`,
                temperatureData: temperature,
                line: 0,
                mashTemp: Number(mashTemp),
            });
        }, 10000);

        setTemperatureInterval(Number(intervalId));

        return () => clearInterval(temperatureInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackTemperature]);

    return (
        <div className="h-full w-full">
            <h1 className="text-grey text-3xl ml-5 mt-5 font-mono">Temperature</h1>
            <Chart ref={chartRef} type="line" data={data} options={options} />
        </div>
    );
}
