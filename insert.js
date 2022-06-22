const { getSensors, addSensorCalibrationData, addSensorDataMultiple, getAlgorithms, addSensorCalibrationOutput, getBaseStations, addBaseCalibrationData, addSensorDataBaseMultiple, addPerformanceValidationOutput } = require('./lib/db');

const createSensorCalibrationData = async () => {
  let datetime = new Date();
  const date = datetime.toISOString().substring(0, 10);
  datetime = new Date(date);
  datetime.setDate(datetime.getDate() - 60);
  const datetimes = [];
  for (let i = 0; i < 61; i++) {
    datetimes.push(datetime);
    datetime = new Date(datetime);
    datetime.setDate(datetime.getDate() + 1);
  }
  const listOfSensors = await getSensors(false);

  for (let datetime of datetimes) {
    const temp = listOfSensors.slice();
    const date = datetime.toISOString().substring(0, 10);
    const maxSensors = 12;
    const minSensors = 4;
    const numOfSensors = Math.floor(Math.random() * (maxSensors - minSensors + 1) + minSensors);
    const sensors = [];
    for (let i = 0; i < numOfSensors; i++) {
      const random = Math.floor(Math.random() * temp.length);
      sensors.push(temp[random]);
      temp.splice(random, 1);
    }
    sensors.sort((a, b) => a - b);

    const sensorCalibrationData = [];
    for (let sensor of sensors) {
      sensorCalibrationData.push([date, sensor.id]);
    }
    const insert = await addSensorCalibrationData(sensorCalibrationData);

    const entries = [];
    for (let i = 0; i < 14400; i++) {
      for (let sensor of sensors) {
        entries.push([datetime.toISOString(), sensor.id, Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
      }
      datetime = new Date(datetime);
      datetime.setSeconds(datetime.getSeconds() + 6);
    }

    const sensorData = await addSensorDataMultiple(entries);
    const fileName = `scd_${date}.csv`;
    const versions = await getAlgorithms();
    for (let version of versions) {
      const versionName = version.major + '.' + version.minor + '.' + version.patch;
      const entriesSCO = [];
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
        entriesSCO.push([fileName, date, versionName, sensor.id, topLeft, topMid, topRight, midLeft, midMid, midRight, botLeft, botMid, botRight]);
      }
      const insert = await addSensorCalibrationOutput(entriesSCO);
    }
  }
}

const createBaseCalibrationData = async () => {
  let datetime = new Date();
  const date = datetime.toISOString().substring(0, 10);
  datetime = new Date(date);
  datetime.setDate(datetime.getDate() - 60);
  const datetimes = [];
  for (let i = 0; i < 61; i++) {
    datetimes.push(datetime);
    datetime = new Date(datetime);
    datetime.setDate(datetime.getDate() + 1);
  }

  const listOfBaseStations = await getBaseStations();
  const listOfSensors = await getSensors(true);

  for (let datetime of datetimes) {
    const baseStation = listOfBaseStations[Math.floor(Math.random() * listOfBaseStations.length)];
    const temp = listOfSensors.slice();
    const date = datetime.toISOString().substring(0, 10);
    const sensors = [];
    for (let i = 0; i < 3; i++) {
      const random = Math.floor(Math.random() * temp.length);
      sensors.push(temp[random]);
      temp.splice(random, 1);
    }
    sensors.sort((a, b) => a - b);

    const baseCalibrationData = [];
    for (let sensor of sensors) {
      baseCalibrationData.push([date, baseStation.id, sensor.id]);
    }
    const insert = await addBaseCalibrationData(baseCalibrationData);

    const entries = [];
    for (let i = 0; i < 108000; i++) {
      for (let sensor of sensors) {
        entries.push([datetime.toISOString(), baseStation.id, sensor.id, Math.random().toFixed(2), Math.random().toFixed(2), Math.random().toFixed(2)]);
      }
      datetime = new Date(datetime);
      datetime.setMilliseconds(datetime.getMilliseconds() + 800);
    }

    const sensorData = await addSensorDataBaseMultiple(entries);
    const fileName = `bcd_${date}.csv`;
    const versions = await getAlgorithms();
    const entriesPVO = [];
    for (let version of versions) {
      const versionName = version.major + '.' + version.minor + '.' + version.patch;
      for (let sensor of sensors) {
        const accuracy = Math.random().toFixed(2);
        const precision = Math.random().toFixed(2);
        entriesPVO.push([date, versionName, baseStation.id, sensor.id, accuracy, precision]);
      }
      const insert = await addPerformanceValidationOutput(entriesPVO);
    }
  }
};


createSensorCalibrationData();
createBaseCalibrationData();
console.log('Done! Mass inserted data successfully!');






