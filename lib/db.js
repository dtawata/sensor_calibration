const { Pool, Client } = require('pg');
const format = require('pg-format');

const pool = new Pool({
  user: 'danieltawata',
  host: 'localhost',
  database: 'omte',
  password: '',
  port: 5432,
});

// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })
// const client = new Client({
//   user: 'daniel',
//   host: 'localhost',
//   database: 'practice',
//   password: 'daniel',
//   port: 5432,
// })
// client.connect()
// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   client.end()
// })

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

const addSensorData = async ({ datetime, sensor_id, x, y, z, base_station_id }) => {
  try {
    const queryString = 'INSERT INTO sensor_data (datetime, sensor_id, x, y, z, base_station_id) VALUES ($1, $2, $3, $4, $5, $6)';
    const queryArgs = [datetime, sensor_id, x, y, z, base_station_id];
    const res = await pool.query(queryString, queryArgs);
    return res;
  } catch (err) {
    console.log(err);
  }
};

const addSensorCalibrationOutput = async (entries) => {
  try {
    const queryString = format('INSERT INTO sensor_calibration_output (calibration_file, generation_date, algorithm_id, sensor_id, top_left, top_mid, top_right, mid_left, mid_mid, mid_right, bot_left, bot_mid, bot_right) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
  } catch (err) {
    console.log(err);
  }
};
const addPerformanceValidationOutput = async (entries) => {
  try {
    const queryString = format('INSERT INTO performance_validation_output (validation_date, algorithm_id, base_station_id, sensor_id,accuracy, precision) VALUES %L', entries);
    const res = await pool.query(queryString);
    return res;
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

module.exports = {
  getSensors,
  getBaseStations,
  addSensorCalibrationData,
  addBaseCalibrationData,
  addSensorCalibrationOutput,
  addPerformanceValidationOutput,
  addSensorData,
  getAlgorithms,
};