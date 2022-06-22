# sensor_calibration

## Getting started
1. Install Postgres (skip if already installed)
  https://www.postgresql.org/download/
2. Install TimeScaleDB (skip if already installed)
  https://docs.timescale.com/install/latest/self-hosted/
3. Copy `.env.example` file and rename to `.env`.
4. Fill in `POSTGRES_USER`, `POSTGRES_PASSWORD`, and change `POSTGRES_PORT` if necessary. 
4. Run `psql -f schema.sql` on root directory.
5. Run `npm install`.
6. Run `npm run build`.
7. Run `npm start`.
8. Go to http://localhost:3000 to access application.

## Using the application
**Step 1** is used to generate the Sensor Calibration Data + Base Station Calibration Data.
You can download the corresponding CSV file on the right once it's done.

**Step 2** generates a Sensor Calibration Output from a Sensor Calibration Data file and a Performance Validation Output from a Base Station Calibration Data file. At this point, both the uploaded CSV file and the data output gets inserted into the database. 
You can download the corresponding CSV file on the right once it's done.

**Step 3** plots the data (based off of different filters) onto a chart. Different file types will have different filters associated with it.

**Skip Steps 1 -2 & Mass Insert Data** Run `psql -f schema.sql` and then `node insert.js` on the root directory to insert data directly into the database (mimicking 60 days of data). You can skip to **Step 3** once complete.
