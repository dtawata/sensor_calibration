import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Generator from './Generator';
import Output from './Output';
import Chart from './Chart';

const App = (props) => {
  const [step, setStep] = useState(1);
  const [downloads, setDownloads] = useState([]);
  const [outputDownloads, setOutputDownloads] = useState([]);
  const date = useRef();
  const [csvFile, setCsvFile] = useState();
  const [algorithms, setAlgorithms] = useState([]);
  const version = useRef();
  const upload = useRef();
  const nav = useRef({ step1: 'active', step2: '', step3: '' });

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
        return prevOutputDownloads.concat([{name: `sco_${date}_${version.current.value}.csv`, cta: `${date}: Sensor Calibration Output - v${version.current.value}`, data: res.data}]);
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
        return prevOutputDownloads.concat([{name: `pvo_${date}_${version.current.value}.csv`, cta: `${date}: Performance Validation Output - v${version.current.value}`, data: res.data}]);
      });
    })
  };

  useEffect(() => {
    axios.get('http://localhost:3000/api/algorithms')
    .then((res) => {
      setAlgorithms(res.data);
    })
  }, [])

  const updateStep = (section) => {
    nav.current.step1 = '';
    nav.current.step2 = '';
    nav.current.step3 = '';
    nav.current[`step${section}`] = 'active';
    setStep(section);
  };

  return (
    <div className='container'>
      <nav>
        <ul>
          <li onClick={() => { updateStep(1); }} className={nav.current.step1}>Step 1: Generate Data</li>
          <li onClick={() => { updateStep(2); }} className={nav.current.step2}>Step 2: Get Output</li>
          <li onClick={() => { updateStep(3); }} className={nav.current.step3}>Step 3: Analyze Data</li>
        </ul>
      </nav>
      {step === 1 && <Generator date={date} downloads={downloads} generateData={generateData} />}
      {step === 2 && <Output outputDownloads={outputDownloads} algorithms={algorithms} version={version} sendCsv={sendCsv} setCsvFile={setCsvFile} upload={upload} />}
      {step === 3 && <Chart />}
    </div>
  );
};

export default App;