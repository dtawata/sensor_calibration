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
    let queryString = 'SELECT * FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND calibration_file = $3 AND algorithm_version = $4 AND sensor_id = $5';
    let queryArgs = [startDate, endDate, calibrationFile, algorithmVersion, sensorId];

    if (calibrationFile === '*' && algorithmVersion === '*') {
      queryString = 'SELECT * FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND sensor_id = $3';
      queryArgs = [startDate, endDate, sensorId];
    } else if (calibrationFile === '*' && algorithmVersion !== '*') {
      queryString = 'SELECT * FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND algorithm_version = $3 AND sensor_id = $4';
      queryArgs = [startDate, endDate, algorithmVersion, sensorId];
    } else if (calibrationFile !== '*' && algorithmVersion === '*') {
      queryString = 'SELECT * FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND calibration_file = $3  AND sensor_id = $4';
      queryArgs = [startDate, endDate, calibrationFile, sensorId];
    }

    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getPerfomanceValidationOutput = async ({ startDate, endDate, version, baseStationId, sensorId }) => {
  try {
    let queryString = 'SELECT * FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND algorithm_version = $3 AND base_station_id = $4 AND sensor_id = $5 ORDER BY validation_date';
    let queryArgs = [startDate, endDate, version, baseStationId, sensorId];
    if (version === '*') {
      queryString = 'SELECT * FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND base_station_id = $3 AND sensor_id = $4 ORDER BY validation_date';
      queryArgs = [startDate, endDate, baseStationId, sensorId];
    }
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensors = async ({ start, end }) => {
  try {
    const queryString = 'SELECT DISTINCT sensor_id FROM sensor_calibration_data WHERE calibration_date BETWEEN $1 AND $2 ORDER BY sensor_id';
    // const queryString = 'SELECT DISTINCT sensor_id FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND base_station_id IS NULL ORDER BY sensor_id';
    const queryArgs = [start, end];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensorsBase = async ({ start, end, baseStation }) => {
  try {
    const queryString = 'SELECT DISTINCT sensor_id FROM base_station_calibration_data WHERE calibration_date BETWEEN $1 AND $2 AND base_station_id = $3 ORDER BY sensor_id';
    // const queryString = 'SELECT DISTINCT sensor_id FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND base_station_id = $3 ORDER BY sensor_id';
    const queryArgs = [start, end, baseStation];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensorsBasePVO = async ({ start, end, baseStation, version }) => {
  try {
    let queryString = 'SELECT DISTINCT sensor_id FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND algorithm_version = $3 AND base_station_id = $4 ORDER BY sensor_id';
    let queryArgs = [start, end, version, baseStation];
    if (version === '*') {
      queryString = 'SELECT DISTINCT sensor_id FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND base_station_id = $3 ORDER BY sensor_id';
      queryArgs = [start, end, baseStation];
    }
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueSensorsSCO = async ({ file, version }) => {
  try {
    let queryString = 'SELECT DISTINCT sensor_id FROM sensor_calibration_output WHERE calibration_file = $1 AND algorithm_version = $2 ORDER BY sensor_id';
    let queryArgs = [file, version];
    if (file === '*' && version === '*') {
      queryString = 'SELECT DISTINCT sensor_id FROM sensor_calibration_output ORDER BY sensor_id';
      queryArgs = [];
    } else if (file === '*' && version !== '*') {
      queryString = 'SELECT DISTINCT sensor_id FROM sensor_calibration_output WHERE algorithm_version = $1 ORDER BY sensor_id';
      queryArgs = [version];
    } else if (file !== '*' && version === '*') {
      queryString = 'SELECT DISTINCT sensor_id FROM sensor_calibration_output WHERE calibration_file = $1 ORDER BY sensor_id'
      queryArgs = [file];
    }
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueBaseStations = async ({ start, end }) => {
  try {
    const queryString = 'SELECT DISTINCT base_station_id FROM sensor_data WHERE datetime BETWEEN $1 AND $2 ORDER BY base_station_id';
    const queryArgs = [start, end];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
};

const getUniqueBaseStationsPVO = async ({ start, end, version }) => {
  try {
    let queryString = 'SELECT DISTINCT base_station_id FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 AND algorithm_version = $3 ORDER BY base_station_id';
    let queryArgs = [start, end, version];
    if (version === '*') {
      queryString = 'SELECT DISTINCT base_station_id FROM performance_validation_output WHERE validation_date BETWEEN $1 AND $2 ORDER BY base_station_id';
      queryArgs = [start, end];
    }
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
    let queryString = 'SELECT DISTINCT algorithm_version FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2 AND calibration_file = $3';
    let queryArgs = [start, end, calibration];
    if (calibration === '*') {
      queryString = 'SELECT DISTINCT algorithm_version FROM sensor_calibration_output WHERE generation_date BETWEEN $1 AND $2';
      queryArgs = [start, end];
    }
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

const getSensorDataGroup = async ({ startDate, endDate, sensorId, groupBy }) => {
  try {
    let queryString =  "SELECT date_part('year', datetime) AS year, date_part('month', datetime) AS month, date_part('day', datetime) AS day, date_part('hour', datetime) AS hour, round(avg(x), 4) AS x_avg, round(avg(y), 4) AS y_avg, round(avg(z), 4) AS z_avg FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND sensor_id = $3 GROUP BY year, month, day, hour ORDER BY year, month, day, hour";

    if (groupBy === 'year') {
      queryString =  "SELECT date_part('year', datetime) AS year, round(avg(x), 4) AS x_avg, round(avg(y), 4) AS y_avg, round(avg(z), 4) AS z_avg FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND sensor_id = $3 GROUP BY year ORDER BY year";
    } else if (groupBy === 'month') {
      queryString =  "SELECT date_part('year', datetime) AS year, date_part('month', datetime) AS month, round(avg(x), 4) AS x_avg, round(avg(y), 4) AS y_avg, round(avg(z), 4) AS z_avg FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND sensor_id = $3 GROUP BY year, month ORDER BY year, month";
    } else if (groupBy === 'day') {
      queryString =  "SELECT date_part('year', datetime) AS year, date_part('month', datetime) AS month, date_part('day', datetime) as day, round(avg(x), 4) AS x_avg, round(avg(y), 4) AS y_avg, round(avg(z), 4) AS z_avg FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND sensor_id = $3 GROUP BY year, month, day ORDER BY year, month, day";
    } else if (groupBy === 'hour') {
      queryString =  "SELECT date_part('year', datetime) AS year, date_part('month', datetime) AS month, date_part('day', datetime) AS day, date_part('hour', datetime) AS hour, round(avg(x), 4) AS x_avg, round(avg(y), 4) AS y_avg, round(avg(z), 4) AS z_avg FROM sensor_data WHERE datetime BETWEEN $1 AND $2 AND sensor_id = $3 GROUP BY year, month, day, hour ORDER BY year, month, day, hour";
    }

    const queryArgs = [startDate, endDate, sensorId];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
}


const getBaseSensorDataGroup = async ({ startDate, endDate, baseStationId, sensorId }) => {
  try {
    const queryString =  "SELECT date_part('year', datetime) AS year, date_part('month', datetime) AS month, date_part('day', datetime) as day, round(avg(x), 4) AS x_avg, round(avg(y), 4) AS y_avg, round(avg(z), 4) AS z_avg FROM sensor_data WHERE datetime BETWEEN $1 AND $2  AND base_station_id = $3 AND sensor_id = $4 GROUP BY year, month, day ORDER BY year, month, day";
    const queryArgs = [startDate, endDate, baseStationId, sensorId];
    const res = await pool.query(queryString, queryArgs);
    return res.rows;
  } catch (err) {
    console.log(err);
  }
}

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
  getPerfomanceValidationOutput,
  getSensorDataGroup,
  getBaseSensorDataGroup
};