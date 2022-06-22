const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { writeToPath } = require('@fast-csv/format');
const csvUpload = require("express-fileupload");
const { getSensors, getBaseStations, getAlgorithms, addSensorData, addSensorCalibrationData, addBaseCalibrationData, addSensorCalibrationOutput, addPerformanceValidationOutput, getSensorData, getUniqueSensors, getUniqueBaseStations, getUniqueBaseStationsPVO, getUniqueSensorsBase, getUniqueCalibrationFiles, getUniqueAlgorithmVersionsSCO, getUniqueAlgorithmVersionsPVO, getUniqueSensorsSCO, getSensorCalibrationOutput, getUniqueSensorsBasePVO, getPerfomanceValidationOutput } = require('./lib/db');

app.use(csvUpload());
app.use(express.static('public'));
app.use(express.json());

app.get('/api/sensor_calibration_data', async (req, res) => {
  let datetime = new Date(req.query.date);
  const date = datetime.toISOString().substring(0, 10);
  const listOfSensors = await getSensors(false);
  const maxSensors = 12;
  const minSensors = 4;
  const numOfSensors = Math.floor(Math.random() * (maxSensors - minSensors + 1) + minSensors);

  const sensors = [];
  for (let i = 0; i < numOfSensors; i++) {
    const random = Math.floor(Math.random() * listOfSensors.length);
    sensors.push(listOfSensors[random]);
    listOfSensors.splice(random, 1);
  }
  sensors.sort((a, b) => a - b);

  const sensorCalibrationData = [];
  for (let sensor of sensors) {
    sensorCalibrationData.push([date, sensor.id]);
  }
  const insert = await addSensorCalibrationData(sensorCalibrationData);

  const entries = [['datetime', 'sensor_id', 'sensor_type', 'x', 'y', 'z']];
  for (let i = 0; i < 14400; i++) {
    for (let sensor of sensors) {
      entries.push([datetime.toISOString(), sensor.id, sensor.type, Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
    }
    datetime = new Date(datetime);
    datetime.setSeconds(datetime.getSeconds() + 6);
  }

  const filePath = path.resolve(__dirname, 'csv', `scd_${date}.csv`);
  writeToPath(filePath, entries)
  .on('error', err => console.error(err))
  .on('finish', () => {
    const stream = fs.createReadStream(filePath);
    res.attachment(filePath);
    stream.pipe(res);
  });
});

app.get('/api/base_calibration_data', async (req, res) => {
  let datetime = new Date(req.query.date);
  const date = datetime.toISOString().substring(0, 10);
  const listOfBaseStations = await getBaseStations();
  const baseStation = listOfBaseStations[Math.floor(Math.random() * listOfBaseStations.length)];
  const listOfSensors = await getSensors(true);

  const sensors = [];
  for (let i = 0; i < 3; i++) {
    const random = Math.floor(Math.random() * listOfSensors.length);
    sensors.push(listOfSensors[random]);
    listOfSensors.splice(random, 1);
  }
  sensors.sort((a, b) => a - b);

  const baseCalibrationData = [];
  for (let sensor of sensors) {
    baseCalibrationData.push([date, baseStation.id, sensor.id]);
  }
  const insert = await addBaseCalibrationData(baseCalibrationData);

  const entries = [['datetime', 'base_station_id', 'sensor_id', 'x', 'y', 'z']];
  for (let i = 0; i < 108000; i++) {
    for (let sensor of sensors) {
      entries.push([datetime.toISOString(), baseStation.id, sensor.id, Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
    }
    datetime = new Date(datetime);
    datetime.setMilliseconds(datetime.getMilliseconds() + 800);
  }

  const filePath = path.resolve(__dirname, 'csv', `bcd_${date}.csv`);
  writeToPath(filePath, entries)
  .on('error', err => console.error(err))
  .on('finish', () => {
    const stream = fs.createReadStream(filePath);
    res.attachment(filePath);
    stream.pipe(res);
  });
});

app.post('/api/upload_scd/:version', (req, res) => {
  const date = new Date().toISOString().substring(0, 10);
  const version = req.params.version;
  const file = req.files.file;

  file.mv(path.resolve(__dirname, 'csv', file.name), (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    const sensors = [];
    fs.createReadStream(path.resolve(__dirname, 'csv', file.name))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async (row) => {
      if (!sensors.includes(row.sensor_id)) {
        sensors.push(row.sensor_id);
      }
      const insert = await addSensorData(row);
    })
    .on('end', async (rowCount) => {
      const entries = [['calibration_file', 'generation_date', 'algorithm_version', 'sensor_id', 'top_left', 'top_mid', 'top_right', 'mid_left', 'mid_mid', 'mid_right', 'bot_left', 'bot_mid', 'bot_right']];
      for (let sensor of sensors) {
        const topLeft = (Math.floor(Math.random() * (1200 - 800) + 800)/1000).toFixed(2);
        const topMid = (Math.floor(Math.random() * 300)/1000).toFixed(2);
        const topRight = (Math.floor(Math.random() * 300)/1000).toFixed(2);
        const midLeft = (Math.floor(Math.random() * 300)/1000).toFixed(2);
        const midMid = (Math.floor(Math.random() * (1200 - 800) + 800)/1000).toFixed(2);
        const midRight = (Math.floor(Math.random() * 300)/1000).toFixed(2);
        const botLeft = (Math.floor(Math.random() * 300)/1000).toFixed(2);
        const botMid = (Math.floor(Math.random() * 300)/1000).toFixed(2);
        const botRight = (Math.floor(Math.random() * (1200 - 800) + 800)/1000).toFixed(2);
        entries.push([file.name, date, version, sensor, topLeft, topMid, topRight, midLeft, midMid, midRight, botLeft, botMid, botRight]);
      }
      const insert = await addSensorCalibrationOutput(entries.slice(1));

      const filePath = path.resolve(__dirname, 'csv', `sco_${date}_${version}.csv`);
      writeToPath(filePath, entries)
      .on('error', err => console.error(err))
      .on('finish', () => {
        const stream = fs.createReadStream(filePath);
        res.attachment(filePath);
        stream.pipe(res);
      });
    });
  });
});

app.post('/api/upload_bcd/:version', (req, res) => {
  const date = new Date().toISOString().substring(0, 10);
  const version = req.params.version;
  const file = req.files.file;

  file.mv(path.resolve(__dirname, 'csv', file.name), (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    let baseStationId = null;
    const sensors = [];
    fs.createReadStream(path.resolve(__dirname, 'csv', file.name))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', async (row) => {
      if (!sensors.includes(row.sensor_id)) {
        sensors.push(row.sensor_id);
        if (!baseStationId) {
          baseStationId = row.base_station_id;
        }
      }
      const insert = await addSensorData(row);
    })
    .on('end', async (rowCount) => {
      const entries = [['validation_date', 'algorithm_version', 'base_station_id', 'sensor_id', 'accuracy', 'precision']];
      for (let sensor of sensors) {
        const accuracy = Math.random().toFixed(2);
        const precision = Math.random().toFixed(2);
        entries.push([date, version, baseStationId, sensor, accuracy, precision]);
      }
      const insert = await addPerformanceValidationOutput(entries.slice(1));

      const filePath = path.resolve(__dirname, 'csv', `pvo_${date}_${version}.csv`);
      writeToPath(filePath, entries)
      .on('error', err => console.error(err))
      .on('finish', () => {
        const stream = fs.createReadStream(filePath);
        res.attachment(filePath);
        stream.pipe(res);
      });
    });
  });
});

app.get('/api/algorithms', async (req, res) => {
  const algorithms = await getAlgorithms();
  res.send(algorithms);
});

app.get('/api/chart', async (req, res) => {
  console.log('api/chart', req.query);
  let { sensorId, startDate, endDate } = req.query;
  startDate =  new Date(startDate);
  endDate = new Date(endDate);

  const data = await getSensorData({ sensorId, startDate, endDate });
  console.log('data', data);
  res.send(data);
});

app.get('/api/chart_sco', async (req, res) => {
  const { startDate, endDate, calibrationFile, algorithmVersion, sensorId } = req.query;
  console.log(req.query);
  const data = await getSensorCalibrationOutput({ startDate, endDate, calibrationFile, algorithmVersion, sensorId,  });
  console.log('data', data);
  res.send(data);
});

app.get('/api/chart_pvo', async (req, res) => {
  const { startDate, endDate, version, baseStationId, sensorId } = req.query;
  const data = await getPerfomanceValidationOutput({ startDate, endDate, version, baseStationId, sensorId });
  console.log('data', data);
  res.send(data);
});

app.get('/api/unique_sensors', async (req, res) => {
  let { file, start, end } = req.query;
  start = new Date(start);
  end = new Date(end);
  if (file === 'scd') {
    const uniqueSensors = await getUniqueSensors({ start, end });
    res.send(uniqueSensors);
  }
});

app.get('/api/unique_sensors_base', async (req, res) => {
  const { file, start, end, baseStation, version } = req.query;
  if (file === 'bcd') {
    const uniqueSensors = await getUniqueSensorsBase({start, end, baseStation });
    res.send(uniqueSensors);
  } else {
    const uniqueSensors = await getUniqueSensorsBasePVO({start, end, baseStation, version });
    res.send(uniqueSensors);
  }
});

app.get('/api/unique_sensors_sco', async (req, res) => {
  const { file, version } = req.query;
  const uniqueSensorsSCO = await getUniqueSensorsSCO({ file, version });
  res.send(uniqueSensorsSCO);
});

app.get('/api/unique_base_stations', async (req, res) => {
  let { start, end } = req.query;
  start = new Date(start);
  end = new Date(end);
  const uniqueBaseStations = await getUniqueBaseStations({ start, end });
  for (let i = 0; i < uniqueBaseStations.length; i++) {
    if (!uniqueBaseStations[i].base_station_id) {
      uniqueBaseStations.splice(i, 1);
      break;
    }
  }
  res.send(uniqueBaseStations);
});

app.get('/api/unique_base_stations_pvo', async (req, res) => {
  const { start, end, version } = req.query;
  const uniqueBaseStations = await getUniqueBaseStationsPVO({ start, end, version });
  res.send(uniqueBaseStations);
});

app.get('/api/unique_calibration_files', async (req, res) => {
  const { start, end } = req.query;
  const uniqueCalibrationFiles = await getUniqueCalibrationFiles({ start, end });
  res.send(uniqueCalibrationFiles);
});

app.get('/api/unique_algorithm_versions', async (req, res) => {
  const { start, end, file, calibration } = req.query;
  if (file === 'sco') {
    const uniqueAlgorithmVersions = await getUniqueAlgorithmVersionsSCO({ start, end, calibration });
    res.send(uniqueAlgorithmVersions);
  } else {
    const uniqueAlgorithmVersions = await getUniqueAlgorithmVersionsPVO({ start, end });
    res.send(uniqueAlgorithmVersions);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
});