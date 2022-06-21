const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { writeToPath } = require('@fast-csv/format');
const csvUpload = require("express-fileupload");
const { getSensors, getBaseStations, addSensorCalibrationData, addBaseCalibrationData, addSensorCalibrationOutput, addPerformanceValidationOutput, addSensorData, getAlgorithms } = require('./lib/db');

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
  for (let i = 0; i < 14400; i++) {
    for (let sensor of sensors) {
      entries.push([datetime.toISOString(), baseStation.id, sensor.id, Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
    }
    datetime = new Date(date);
    datetime.setSeconds(datetime.getSeconds() + 6);
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

      const filePath = path.resolve(__dirname, 'csv', `sco_${date}.csv`);
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
    .on('data', (row) => {
      if (!sensors.includes(row.sensor_id)) {
        sensors.push(row.sensor_id);
        if (!baseStationId) {
          baseStationId = row.base_station_id;
        }
      }
      console.log(row);
      addSensorData(row);
    })
    .on('end', async (rowCount) => {
      const entries = [['validation_date', 'algorithm_version', 'base_station_id', 'sensor_id', 'accuracy', 'precision']];
      for (let sensor of sensors) {
        const accuracy = Math.random().toFixed(2);
        const precision = Math.random().toFixed(2);
        entries.push([date, version, baseStationId, sensor, accuracy, precision]);
      }
      const insert = await addPerformanceValidationOutput(entries.slice(1));

      const filePath = path.resolve(__dirname, 'csv', `pvo_${date}.csv`);
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
  console.log(algorithms)
  res.send(algorithms);
});

const port = 3000;
app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
});