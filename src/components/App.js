
import React, { useState } from 'react';
import axios from 'axios';

const App = (props) => {
  const [sensorData, setSensorData] = useState(null);
  const [sensorCalibrationData, setSensorCalibrationData] = useState(null);

  const generateData = async () => {
     axios.get('http://localhost:3000/api/sensor_data')
     .then((res) => {
      setSensorData(res.data);
     });

     axios.get('http://localhost:3000/api/sensor_calibration_data')
     .then((res) => {
      setSensorCalibrationData(res.data);
     });
  };

  return (
    <div className='container'>
      <div className='generator'>
        <h2 className='title'>Data Generator</h2>
        <button onClick={generateData}>Generate Data</button>
      </div>
      <div className='downloads'>
        <h2 className='title'>Downloads</h2>
        {sensorCalibrationData && <div className='download_link'><a href={`data:text/csv;charset=utf-8,${(sensorCalibrationData)}`} download="sensor_calibration_data.csv">Download Sensor Calibration Data</a></div>}
        {sensorData && <div className='download_link'><a href={`data:text/csv;charset=utf-8,${(sensorData)}`} download="sensor_data.csv">Download Sensor Data</a></div>}
      </div>
    </div>
  );
};

export default App;