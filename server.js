const express = require('express');
const app = express();
const { writeToPath } = require('@fast-csv/format');
const path = require('path');
const fs = require('fs');

app.use(express.static('public'));
app.use(express.json());

app.get('/api/sensor_data', (req, res) => {
  const sensorIds = Array.from({length: 20}, (_, index) => {
    return index + 1;
  });
  const maxSensors = 12;
  const minSensors = 4;
  const numOfSensors = Math.floor(Math.random() * (maxSensors - minSensors + 1) + minSensors);
  const sensors = [];
  for (let i = 0; i < numOfSensors; i++) {
    const random = Math.floor(Math.random() * sensorIds.length);
    sensors.push(sensorIds[random]);
    sensorIds.splice(random, 1);
  }
  sensors.sort((a, b) => a - b);

  let dates = [new Date('2022-03-14')];
  const sensor_calibration_data = [['date', 'sensor_id']];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i].toISOString().substring(0, 10);
    for (let j = 0; j < sensors.length; j++) {
      sensor_calibration_data.push([date, sensors[j]]);
    }
  }

  const entries = [['datetime', 'sensor_id', 'x', 'y', 'z']];
  for (let i = 0; i < dates.length; i++) {
    let date = dates[i];
    for (let j = 0; j < 14399; j++) {
      const newDate = new Date(date);
      newDate.setSeconds(newDate.getSeconds() + 6);
      for (let k = 0; k < sensors.length; k++) {
        entries.push([newDate.toISOString(), sensors[k], Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
      }
      date = newDate;
    }
  }

  writeToPath(path.resolve(__dirname, 'sensor_data.csv'), entries)
      .on('error', err => console.error(err))
      .on('finish', () => {
        console.log('Done writing.');
        const filename = __dirname + '/sensor_data.csv';
        const stream = fs.createReadStream(filename);
        res.attachment(filename);
        stream.pipe(res);
      });
});


app.get('/api/sensor_calibration_data', (req, res) => {
  const sensorIds = Array.from({length: 20}, (_, index) => {
    return index + 1;
  });
  const maxSensors = 12;
  const minSensors = 4;
  const numOfSensors = Math.floor(Math.random() * (maxSensors - minSensors + 1) + minSensors);
  const sensors = [];
  for (let i = 0; i < numOfSensors; i++) {
    const random = Math.floor(Math.random() * sensorIds.length);
    sensors.push(sensorIds[random]);
    sensorIds.splice(random, 1);
  }
  sensors.sort((a, b) => a - b);

  let dates = [new Date('2022-03-14')];
  const sensor_calibration_data = [['date', 'sensor_id']];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i].toISOString().substring(0, 10);
    for (let j = 0; j < sensors.length; j++) {
      sensor_calibration_data.push([date, sensors[j]]);
    }
  }

  const entries = [['datetime', 'sensor_id', 'x', 'y', 'z']];
  for (let i = 0; i < dates.length; i++) {
    let date = dates[i];
    for (let j = 0; j < 14399; j++) {
      const newDate = new Date(date);
      newDate.setSeconds(newDate.getSeconds() + 6);
      for (let k = 0; k < sensors.length; k++) {
        entries.push([newDate.toISOString(), sensors[k], Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
      }
      date = newDate;
    }
  }

  writeToPath(path.resolve(__dirname, 'sensor_calibration_data.csv'), sensor_calibration_data)
      .on('error', err => console.error(err))
      .on('finish', () => {
        console.log('Done writing.')
        const filename = __dirname + '/sensor_calibration_data.csv';
        const stream = fs.createReadStream(filename);
        res.attachment(filename);
        stream.pipe(res);
      });
});

app.get('/testing', (req, res) => {
  const filename = __dirname + '/sensor_calibration_data.csv';
  const stream = fs.createReadStream(filename);
  res.attachment(filename);
  stream.pipe(res);
})

const port = 3000;
app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
});