import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Generator from './Generator';
import Output from './Output';

const App = (props) => {
  const [step, setStep] = useState(1);
  const [downloads, setDownloads] = useState([]);
  const [outputDownloads, setOutputDownloads] = useState([]);
  const date = useRef();
  const [csvFile, setCsvFile] = useState();
  const [algorithms, setAlgorithms] = useState([]);
  const version = useRef();
  const upload = useRef();

  const generateData = async () => {
    axios.get('http://localhost:3000/api/sensor_calibration_data', {
      params: {
        date: date.current.value
      }
    })
    .then((res) => {
      setDownloads((prevDownloads) => {
        return prevDownloads.concat([{name: `scd_${date.current.value}.csv`, cta: `${date.current.value}: Sensor Calibration Data`, data: res.data}]);
      });
    });

    axios.get('http://localhost:3000/api/base_calibration_data', {
      params: {
        date: date.current.value
      }
    })
    .then((res) => {
      setDownloads((prevDownloads) => {
        return prevDownloads.concat([{name: `bcd_${date.current.value}.csv`, cta: `${date.current.value}: Base Station Calibration Data`, data: res.data}]);
      });
    });
  };

  const sendCsv = async (e) => {
    e.preventDefault();
    if (csvFile.name.substring(0, 3) === 'scd') {
      calibrationOutput();
    } else if (csvFile.name.substring(0, 3) === 'bcd') {
      performanceValidation();
    } else {
      alert('File is not properly formatted.');
    }
  };

  const calibrationOutput = () => {
    const formData = new FormData();
    formData.append('file', csvFile);
    axios.post(`http://localhost:3000/api/upload_scd/${version.current.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      upload.current.value = '';
      const date = new Date().toISOString().substring(0, 10);
      setOutputDownloads((prevOutputDownloads) => {
        return prevOutputDownloads.concat([{name: `sco_${date}.csv`, cta: `${date}: Sensor Calibration Output`, data: res.data}]);
      });
    })
  };

  const performanceValidation = () => {
    const formData = new FormData();
    formData.append('file', csvFile);
    axios.post(`http://localhost:3000/api/upload_bcd/${version.current.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      upload.current.value = '';
      const date = new Date().toISOString().substring(0, 10);
      setOutputDownloads((prevOutputDownloads) => {
        return prevOutputDownloads.concat([{name: `pvo_${date}.csv`, cta: `${date}: Performance Validation Output`, data: res.data}]);
      });
    })
  };

  useEffect(() => {
    axios.get('http://localhost:3000/api/algorithms')
    .then((res) => {
      setAlgorithms(res.data);
    })
  }, [])

  return (
    <div className='container'>
      <nav>
        <ul>
          <li onClick={() => { setStep(1); }} className='active'>Step 1: Generate Data</li>
          <li onClick={() => { setStep(2); }}>Step 2: Get Output</li>
          <li onClick={() => { setStep(3); }}>Step 3: Analyze Data</li>
        </ul>
      </nav>
      {step === 1 && <Generator date={date} downloads={downloads} generateData={generateData} />}
      {step === 2 && <Output outputDownloads={outputDownloads} algorithms={algorithms} version={version} sendCsv={sendCsv} setCsvFile={setCsvFile} upload={upload} />}
      {step === 3 && <div>Step 3</div>}
    </div>
    // <div className='container'>
    //   <div className='generator'>
    //     <h2 className='title'>Data Generator</h2>
    //     <button onClick={generateData}>Generate Data</button>
    //     </div>
    //     <div className='downloads'>
    //     <h2 className='title'>Downloads</h2>
    //     {sensorCalibrationData && <div className='download_link'><a href={`data:text/csv;charset=utf-8,${(sensorCalibrationData)}`} download="sensor_calibration_data.csv">Download Sensor Calibration Data</a></div>}
    //     {baseCalibrationData && <div className='download_link'><a href={`data:text/csv;charset=utf-8,${(baseCalibrationData)}`} download="base_calibration_data.csv">Download Base Calibration Data</a></div>}
    //     {test && <div className='download_link'><a href={`data:text/csv;charset=utf-8,${(test)}`} download="test.csv">Download Base Test Data</a></div>}

    //     {sensorData && <div className='download_link'><a href={`data:text/csv;charset=utf-8,${(sensorData)}`} download="sensor_data.csv">Download Sensor Data</a></div>}
    //     </div>
    //     <div className='upload'>
    //     <h2 className='title'>Upload</h2>
    //     <form onSubmit={sendCSV}>
    //       <input type="file" name="file" onChange={(e) => { getFile(e) }} />
    //       <button type='submit'>Submit</button>
    //     </form>
    //   </div>
    // </div>
  );
};

export default App;