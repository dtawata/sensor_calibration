require('dotenv').config();

const { Pool, Client } = require('pg');
const format = require('pg-format');
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password:  process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const getSensors = async (boolean) => {
  try {
    const queryString = 'SELECT id, type FROM sensors WHERE base_station = $1';
    const queryArgs = [boolean];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getBaseStations = async () => {
  try {
    const queryString = 'SELECT id FROM base_stations';
    const res = await pool.query(queryString);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getAlgorithms = async () => {
  try {
    const queryString = 'SELECT * FROM algorithms ORDER BY major DESC';
    const res = await pool.query(queryString);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const addSensorData = async ({ datetime, sensor_id, x, y, z }) => {
  try {
    const queryString = 'INSERT INTO sensor_data (datetime, sensor_id, x, y, z) VALUES ($1, $2, $3, $4, $5)';
    const queryArgs = [datetime, sensor_id, x, y, z];
    const res = await pool.query(queryString, queryArgs);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addSensorDataBase = async ({ datetime, sensor_id, x, y, z, base_station_id }) => {
  try {
    const queryString = 'INSERT INTO sensor_data (datetime, sensor_id, x, y, z, base_station_id) VALUES ($1, $2, $3, $4, $5, $6)';
    const queryArgs = [datetime, sensor_id, x, y, z, base_station_id];
    const res = await pool.query(queryString, queryArgs);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addSensorDataMultiple = async (entries) => {
  try {
    const queryString = format('INSERT INTO sensor_data (datetime, sensor_id, x, y, z) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addSensorDataBaseMultiple = async (entries) => {
  try {
    const queryString = format('INSERT INTO sensor_data (datetime, base_station_id, sensor_id, x, y, z) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addSensorCalibrationData = async (entries) => {
  try {
    const queryString = format('INSERT INTO sensor_calibration_data (calibration_date, sensor_id) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addBaseCalibrationData = async (entries) => {
  try {
    const queryString = format('INSERT INTO base_station_calibration_data (calibration_date, base_station_id, sensor_id) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addSensorCalibrationOutput = async (entries) => {
  try {
    const queryString = format('INSERT INTO sensor_calibration_output (calibration_file, generation_date, algorithm_version, sensor_id, top_left, top_mid, top_right, mid_left, mid_mid, mid_right, bot_left, bot_mid, bot_right) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addPerformanceValidationOutput = async (entries) => {
  try {
    const queryString = format('INSERT INTO performance_validation_output (validation_date, algorithm_version, base_station_id, sensor_id,accuracy, precision) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const getSensorCalibrationOutput = async ({ startDate, endDate, calibrationFile, algorithmVersion, sensorId }) => {
  try {
    const queryString = 'SELECT * FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND calibration_file = $3 AND algorithm_version = $4 AND sensor_id = $5';
    const queryArgs = [startDate, endDate, calibrationFile, algorithmVersion, sensorId];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getPerfomanceValidationOutput = async ({ startDate, endDate, version, baseStationId, sensorId }) => {
  try {
    const queryString = 'SELECT * FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND algorithm_version = $3 AND base_station_id = $4 AND sensor_id = $5';
    const queryArgs = [startDate, endDate, version, baseStationId, sensorId];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensors = async ({ start, end }) => {
  try {
    const queryString = 'SELECT DISTINCT sensor_id FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND base_station_id IS NULL';
    const queryArgs = [start, end];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensorsBase = async ({ start, end, baseStation }) => {
  try {
    const queryString = 'SELECT DISTINCT sensor_id FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND base_station_id = $3';
    const queryArgs = [start, end, baseStation];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensorsBasePVO = async ({ start, end, baseStation, version }) => {
  try {
    const queryString = 'SELECT DISTINCT sensor_id FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND algorithm_version = $3 AND base_station_id = $4';
    const queryArgs = [start, end, version, baseStation];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensorsSCO = async ({ file, version }) => {
  try {
    const queryString = 'SELECT DISTINCT sensor_id FROM sensor_calibration_output WHERE calibration_file = $1 AND algorithm_version = $2';
    const queryArgs = [file, version];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueBaseStations = async ({ start, end }) => {
  try {
    const queryString = 'SELECT DISTINCT base_station_id FROM sensor_data WHERE datetime BETWEEN $1 AND $2';
    const queryArgs = [start, end];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueBaseStationsPVO = async ({ start, end, version }) => {
  try {
    const queryString = 'SELECT DISTINCT base_station_id FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND algorithm_version = $3';
    const queryArgs = [start, end, version];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueCalibrationFiles = async ({ start, end }) => {
  try {
    const queryString = 'SELECT DISTINCT calibration_file FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2';
    const queryArgs = [start, end];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueAlgorithmVersionsSCO = async ({ start, end, calibration }) => {
  try {
    const queryString = 'SELECT DISTINCT algorithm_version FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND calibration_file = $3';
    const queryArgs = [start, end, calibration];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueAlgorithmVersionsPVO = async ({ start, end }) => {
  try {
    const queryString = 'SELECT DISTINCT algorithm_version FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2';
    const queryArgs = [start, end];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getSensorData = async ({ startDate, endDate, sensorId }) => {
  try {
    const queryString = 'SELECT * FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND sensor_id = $3 ORDER BY datetime ASC';
    const queryArgs = [startDate, endDate, sensorId];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getSensors,
  getBaseStations,
  getAlgorithms,
  addSensorData,
  addSensorDataBase,
  addSensorDataMultiple,
  addSensorDataBaseMultiple,
  addSensorCalibrationData,
  addBaseCalibrationData,
  addSensorCalibrationOutput,
  addPerformanceValidationOutput,
  getSensorData,
  getUniqueSensors,
  getUniqueBaseStations,
  getUniqueBaseStationsPVO,
  getUniqueSensorsBase,
  getUniqueSensorsBasePVO,
  getUniqueCalibrationFiles,
  getUniqueAlgorithmVersionsSCO,
  getUniqueAlgorithmVersionsPVO,
  getUniqueSensorsSCO,
  getSensorCalibrationOutput,
  getPerfomanceValidationOutput
};