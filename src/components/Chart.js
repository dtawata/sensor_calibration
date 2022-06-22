import React, { useState, useRef, useEffect } from 'react';
import 'chartjs-adapter-moment';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = (props) => {
  const [chartData, setChartData] = useState({ datasets: [] });
  const startDate = useRef();
  const endDate = useRef();
  const fileType = useRef();
  const [config, setConfig] = useState(null);
  const [sensors, setSensors] = useState([]);
  const sensorId = useRef();
  const [baseStations, setBaseStations] = useState([]);
  const baseStationId = useRef();
  const [calibrationFiles, setCalibrationFiles] = useState([]);
  const calibrationFile = useRef();
  const [algorithmVersions, setAlgorithmVersions] = useState([]);
  const algorithmVersion = useRef();

  const options = {
    // response: true,
    scales: {
      x: {
        type: 'time',
        // time: {
        //   unit: 'second',
        //   unitStepSize: 10
        // }
      }
    }
  };

  const changeConfig = () => {
    setConfig(fileType.current.value);
  };

  const getFilters = () => {
    const start = startDate.current.value;
    const end = endDate.current.value;
    const file = fileType.current.value;
    if (!start || !end || !file) return;

    if (file === 'scd') {
      axios.get('/api/unique_sensors', {
        params: { start, end, file }
      })
      .then((res) => {
        setSensors(res.data);
      });
    } else if (file === 'bcd') {
      axios.get('/api/unique_base_stations', {
        params: { start, end }
      })
      .then((res) => {
        setBaseStations(res.data);
      });
    } else if (file === 'sco') {
      axios.get('/api/unique_calibration_files', {
        params: { start, end }
      })
      .then((res) => {
        setCalibrationFiles(res.data);
      });
    } else if (file === 'pvo') {
      getAlgorithmVersions();
    }
  };

  const getBaseStationSensors = () => {
    const start = startDate.current.value;
    const end = endDate.current.value;
    const file = fileType.current.value;
    const baseStation = baseStationId.current.value;
    if (file === 'bcd') {
      axios.get('/api/unique_sensors_base', {
        params: { start, end, file, baseStation }
      })
      .then((res) => {
        setSensors(res.data);
      });
    } else if (file === 'pvo') {
      const version = algorithmVersion.current.value;
      axios.get('/api/unique_sensors_base', {
        params: { start, end, file, baseStation, version }
      })
      .then((res) => {
        setSensors(res.data);
      });
    }
  };

  const getBaseStations = () => {
    const start = startDate.current.value;
    const end = endDate.current.value;
    const version = algorithmVersion.current.value;

    axios.get('/api/unique_base_stations_pvo', {
      params: { start, end, version }
    })
    .then((res) => {
      setBaseStations(res.data);
    });
  };

  const getAlgorithmVersions = () => {
    const start = startDate.current.value;
    const end = endDate.current.value;
    const file = fileType.current.value;
    if (file === 'sco') {
      const calibration = calibrationFile.current.value;
      axios.get('/api/unique_algorithm_versions', {
        params: { start, end, file, calibration }
      })
      .then((res) => {
        setAlgorithmVersions(res.data);
      });
    } else {
      axios.get('/api/unique_algorithm_versions', {
        params: { start, end, file }
      })
      .then((res) => {
        setAlgorithmVersions(res.data);
      });
    }
  };

  const getUniqueSensors = () => {
    const file = calibrationFile.current.value;
    const version = algorithmVersion.current.value;
    axios.get('/api/unique_sensors_sco', {
      params: { file, version }
    })
    .then((res) => {
      setSensors(res.data);
    });
  };

  const onAlgorithmSelected = () => {
    const file = fileType.current.value;
    if (file === 'sco') {
      getUniqueSensors();
    } else if (file === 'pvo') {
      getBaseStations();
    }
  }

  const handleSubmit = () => {
    const file = fileType.current.value;
    if (file === 'scd' || file === 'bcd') {
      axios.get('/api/chart', {
        params: {
          fileType: fileType.current.value,
          startDate: startDate.current.value,
          endDate: endDate.current.value,
          sensorId: sensorId.current.value
        }
      })
      .then((res) => {
        const xArr = [];
        const yArr = [];
        const zArr = [];
        for (let i = 0; i < res.data.length; i++) {
          xArr.push({ x: res.data[i].datetime, y: res.data[i].x });
          yArr.push({ x: res.data[i].datetime, y: res.data[i].y });
          zArr.push({ x: res.data[i].datetime, y: res.data[i].z });
        }
        setChartData({
          datasets: [{
            label: 'x',
            borderColor: 'red',
            data: xArr
          }, {
            label: 'y',
            borderColor: 'blue',
            data: yArr
          }, {
            label: 'z',
            borderColor: 'green',
            data: zArr
          }]
        });
      });
    } else if (file === 'sco') {
      axios.get('/api/chart_sco', {
        params: {
          startDate: startDate.current.value,
          endDate: endDate.current.value,
          calibrationFile: calibrationFile.current.value,
          algorithmVersion: algorithmVersion.current.value,
          sensorId: sensorId.current.value
        }
      })
      .then((res) => {
        const topLeft = [];
        const topMid = [];
        const topRight = [];
        const midLeft = [];
        const midMid = [];
        const midRight = [];
        const botLeft = [];
        const botMid = [];
        const botRight = [];
        for (let i = 0; i < res.data.length; i++) {
          topLeft.push({ x: res.data[i].generation_date, y: res.data[i].top_left });
          topMid.push({ x: res.data[i].generation_date, y: res.data[i].top_mid });
          topRight.push({ x: res.data[i].generation_date, y: res.data[i].top_right });
          midLeft.push({ x: res.data[i].generation_date, y: res.data[i].mid_left });
          midMid.push({ x: res.data[i].generation_date, y: res.data[i].mid_mid });
          midRight.push({ x: res.data[i].generation_date, y: res.data[i].mid_right });
          botLeft.push({ x: res.data[i].generation_date, y: res.data[i].bot_left });
          botMid.push({ x: res.data[i].generation_date, y: res.data[i].bot_mid });
          botRight.push({ x: res.data[i].generation_date, y: res.data[i].bot_right });
        }
        setChartData({
          datasets: [{
            label: 'top_left',
            borderColor: 'red',
            data: topLeft
          }, {
            label: 'top_mid',
            borderColor: 'blue',
            data: topMid
          }, {
            label: 'top_right',
            borderColor: 'green',
            data: topRight
          },{
            label: 'mid_left',
            borderColor: 'purple',
            data: midLeft
          }, {
            label: 'center',
            borderColor: 'orange',
            data: midMid
          }, {
            label: 'mid_right',
            borderColor: 'black',
            data: midRight
          },{
            label: 'bot_left',
            borderColor: 'yellow',
            data: botLeft
          }, {
            label: 'bot_mid',
            borderColor: 'grey',
            data: botMid
          }, {
            label: 'bot_right',
            borderColor: 'teal',
            data: botRight
          }]
        });
      });
    } else if (file === 'pvo') {
      axios.get('/api/chart_pvo', {
        params: {
          startDate: startDate.current.value,
          endDate: endDate.current.value,
          version: algorithmVersion.current.value,
          baseStationId: baseStationId.current.value,
          sensorId: sensorId.current.value
        }
      })
      .then((res) => {
        const accuracy = [];
        const precision = [];
        for (let i = 0; i < res.data.length; i++) {
          accuracy.push({ x: res.data[i].validation_date, y: res.data[i].accuracy });
          precision.push({ x: res.data[i].validation_date, y: res.data[i].precision });
        }
        setChartData({
          datasets: [{
            label: 'accuracy',
            borderColor: 'red',
            data: accuracy
          }, {
            label: 'precision',
            borderColor: 'blue',
            data: precision
          }]
        });
      });
    }
  };

  useEffect(() => {
    console.log('chartdata', chartData);
  }, [chartData])

  return (
    <div className='chart'>
      <div className='config'>
        <div className='date_container'>
          <div className='start_container'>
            <label className='label'>Start Date</label>
            <input onChange={getFilters} type='date' className='start_date' ref={startDate} />
          </div>
          <div className='end_container'>
            <label className='label'>End Date</label>
            <input onChange={getFilters} type='date' className='end_date' ref={endDate} />
          </div>
          <div className='file_container'>
            <div className='label'>File Type</div>
            <select onChange={() => { changeConfig(); getFilters(); }} className='file_type' ref={fileType}>
              <option disabled selected>Select File Type</option>
              <option value='scd'>Sensor Calibration Data</option>
              <option value='bcd'>Base Station Calibration Data</option>
              <option value='sco'>Sensor Calibration Output</option>
              <option value='pvo'>Performance Validation Output</option>
            </select>
          </div>
        </div>
        <div className='flex'>
          {config === 'sco' && <div className='flex'>
            <div className='label2'>Calibration Files</div>
            <select onChange={getAlgorithmVersions} className='calibration_file' ref={calibrationFile}>
              <option disabled selected>Select</option>
              {calibrationFiles.map((calibrationFile, index) => {
                return <option key={index} value={calibrationFile.calibration_file}>{calibrationFile.calibration_file}</option>;
              })}
            </select>
          </div>}
          {(config === 'sco' || config === 'pvo') && <div className='flex'>
            <div className='label2'>Version</div>
            <select onChange={onAlgorithmSelected} className='algorithm_version' ref={algorithmVersion}>
              <option disabled selected>Select</option>
              {algorithmVersions.map((algorithmVersion, index) => {
                return <option key={index} value={algorithmVersion.algorithm_version}>{algorithmVersion.algorithm_version}</option>;
              })}
            </select>
          </div>}
          {(config === 'bcd' ||  config === 'pvo') && <div className='flex'>
            <div className='label2'>Base Station ID</div>
            <select onChange={getBaseStationSensors} className='base_station_id' ref={baseStationId}>
              <option disabled selected>Select</option>
              {baseStations.map((baseStation, index) => {
                return <option key={index} value={baseStation.base_station_id}>{baseStation.base_station_id}</option>;
              })}
            </select>
          </div>}
          {(config === 'scd' || config === 'bcd' || config === 'sco' || config === 'pvo') && <div className='flex'>
            <div className='label2'>Sensor ID</div>
            <select className='sensor_id' ref={sensorId}>
              <option disabled selected>Select</option>
              {sensors.map((sensor, index) => {
                return <option key={index} value={sensor.sensor_id}>{sensor.sensor_id}</option>;
              })}
            </select>
          </div>}
          {config && <button onClick={handleSubmit} className='config_submit'>Submit</button>}
        </div>
      </div>
      <div className='bigchart'>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}

export default Chart;
