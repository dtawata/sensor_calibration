DROP DATABASE IF EXISTS omte;
CREATE DATABASE omte;
\c omte;
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE sensors (
  id SERIAL NOT NULL,
  type INTEGER NOT NULL,
  base_station BOOLEAN NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE base_stations (
  id SERIAL NOT NULL,
  type INTEGER NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE algorithms (
  major CHAR(2),
  minor CHAR(2),
  patch CHAR(2),
  PRIMARY KEY(major, minor, patch)
);

CREATE TABLE sensor_data (
  datetime TIMESTAMPTZ NOT NULL,
  base_station_id INTEGER DEFAULT 0,
  sensor_id INTEGER NOT NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  z NUMERIC NOT NULL
);

SELECT create_hypertable('sensor_data','datetime');
CREATE INDEX ix_sensorid_datetime ON sensor_data (sensor_id, datetime DESC);

CREATE TABLE sensor_calibration_data (
  id SERIAL NOT NULL,
  calibration_date DATE NOT NULL,
  sensor_id INTEGER NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE base_station_calibration_data (
  id SERIAL NOT NULL,
  calibration_date DATE NOT NULL,
  base_station_id INTEGER NOT NULL,
  sensor_id INTEGER NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE sensor_calibration_output (
  id SERIAL NOT NULL,
  calibration_file VARCHAR(255),
  generation_date DATE DEFAULT CURRENT_DATE,
  algorithm_version VARCHAR(8) NOT NULL,
  sensor_id INTEGER NOT NULL,
  top_left NUMERIC NOT NULL,
  top_mid  NUMERIC NOT NULL,
  top_right NUMERIC NOT NULL,
  mid_left NUMERIC NOT NULL,
  mid_mid NUMERIC NOT NULL,
  mid_right NUMERIC NOT NULL,
  bot_left NUMERIC NOT NULL,
  bot_mid NUMERIC NOT NULL,
  bot_right NUMERIC NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE performance_validation_output (
  id SERIAL NOT NULL,
  validation_date DATE DEFAULT CURRENT_DATE,
  algorithm_version VARCHAR(8) NOT NULL,
  base_station_id INTEGER NOT NULL,
  sensor_id INTEGER NOT NULL,
  accuracy NUMERIC NOT NULL,
  precision NUMERIC NOT NULL,
  PRIMARY KEY(id)
);

INSERT INTO sensors (type, base_station)
VALUES (1, true),
(1, true),
(2, true),
(2, true),
(3, true),
(3, true),
(4, false),
(4, false),
(5, false),
(5, false),
(6, false),
(6, false),
(7, false),
(7, false),
(8, false),
(8, false),
(9, false),
(9, false);

INSERT INTO base_stations (type)
VALUES (1),
(2),
(3),
(4);

INSERT INTO algorithms (major, minor, patch)
VALUES ('12', '01', '01'),
('12', '01', '02'),
('12', '02', '01'),
('13', '01', '01');

