require('dotenv').config();

const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST route for device data
router.post('/api/data', async (req, res) => {
  const {
    IMEI_Number, System_Date_Time, Sim_Number, SIMCOM_Manufacturing_DATE,
    ESP_Name, ESP_Serial_Number, ESP_ManufacturingDate, Network_Timestamp,
    Body_Temperature, Heart_Rate, SpO2, accX, accY, accZ, gyroX, gyroY, gyroZ,
    Heading, Location, Battery
  } = req.body;  // Data is automatically parsed from application/x-www-form-urlencoded

  // Assuming the 'status' is determined by the 'Device_Status' field in the form
  const status = Device_Status === 'On' ? 'On' : 'Off';

  try {
    // Check if there's an existing record for this ESP_Serial_Number
    const existingRecord = await pool.query(
      `SELECT * FROM espdata WHERE esp_serial_number = $1 ORDER BY srno DESC LIMIT 1`,
      [ESP_Serial_Number]
    );

    let query = '';
    let params = [];

    if (existingRecord.rows.length > 0) {
      const lastRecord = existingRecord.rows[0];

      // If the status is 'On', insert a new record; otherwise, update the status
      if (status === 'On') {
        query = `INSERT INTO espdata (srno, imei_number, system_date_time, sim_number, simcom_manufacturing_date, esp_name, esp_serial_number, esp_manufacturingdate, network_timestamp, body_temperature, heart_rate, spo2, accx, accy, accz, gyrox, gyroy, gyroz, heading, location, battery)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`;
        params = [
          IMEI_Number, System_Date_Time, Sim_Number, SIMCOM_Manufacturing_DATE,
          ESP_Name, ESP_Serial_Number, ESP_ManufacturingDate, Network_Timestamp,
          Body_Temperature, Heart_Rate, SpO2, accX, accY, accZ, gyroX, gyroY, gyroZ,
          Heading, Location, Battery, status
        ];
      } else {
        // Update the last record if the status is 'Off'
        query = `UPDATE espdata SET system_date_time = $1 WHERE esp_serial_number = $3 AND srno = $4`;
        params = [System_Date_Time, status, ESP_Serial_Number, lastRecord.srno];
      }

    } else {
      // If no existing record, insert a new one
      query = `INSERT INTO espdata (srno, imei_number, system_date_time, sim_number, simcom_manufacturing_date, esp_name, esp_serial_number, esp_manufacturingdate, network_timestamp, body_temperature, heart_rate, spo2, accx, accy, accz, gyrox, gyroy, gyroz, heading, location, battery)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`;
      params = [
        IMEI_Number, System_Date_Time, Sim_Number, SIMCOM_Manufacturing_DATE,
        ESP_Name, ESP_Serial_Number, ESP_ManufacturingDate, Network_Timestamp,
        Body_Temperature, Heart_Rate, SpO2, accX, accY, accZ, gyroX, gyroY, gyroZ,
        Heading, Location, Battery, status
      ];
    }

    // Execute the query
    await pool.query(query, params);
    res.json({ message: 'Record processed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET request to fetch device data
router.get('/api/data', async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM espdata');
    const modifiedResults = results.rows.map(row => ({
      IMEI_Number: row.imei_number,
      System_Date_Time: row.system_date_time,
      Sim_Number: row.sim_number,
      SIMCOM_Manufacturing_DATE: row.simcom_manufacturing_date,
      ESP_Name: row.esp_name,
      ESP_Serial_Number: row.esp_serial_number,
      ESP_ManufacturingDate: row.esp_manufacturingdate,
      Network_Timestamp: row.network_timestamp,
      Body_Temperature: row.body_temperature,
      Heart_Rate: row.heart_rate,
      SpO2: row.spo2,
      accX: row.accx,
      accY: row.accy,
      accZ: row.accz,
      gyroX: row.gyrox,
      gyroY: row.gyroy,
      gyroZ: row.gyroz,
      Heading: row.heading,
      Location: row.location,
      Battery: row.battery,
      // Add other fields as necessary
    }));
    
    res.json(modifiedResults);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



module.exports = router;
