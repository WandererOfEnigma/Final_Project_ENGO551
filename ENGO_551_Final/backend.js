const { Client } = require('pg');

// Create a new PostgreSQL client
const client = new Client({
    user: '', // Your PostgreSQL username
    host: '', // Your PostgreSQL host
    database: '', // Your PostgreSQL database name
    password: '', // Your PostgreSQL password
    port:, // Your PostgreSQL port
});

// Connect to the database
client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        // Call function to create table if not exists
        createTableIfNotExists();
    })
    .catch(err => console.error('Error connecting to PostgreSQL database', err));

// Function to create table if not exists
async function createTableIfNotExists() {
    try {
        // Create table for incidents if not exists
        const createIncidentsTableQuery = `
            CREATE TABLE IF NOT EXISTS incidents (
                id SERIAL PRIMARY KEY,
                coordinates POINT,
                responder VARCHAR(255),
                response_time INTEGER
            )
        `;
        await client.query(createIncidentsTableQuery);
        console.log('Incidents table created or already exists');
    } catch (error) {
        console.error('Error creating table', error);
    }
}

// Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Route to handle incident report
app.post('/report-incident', async (req, res) => {
    const { coordinates, responder, responseTime } = req.body;
    try {
        // Insert incident data into the database
        const insertIncidentQuery = 'INSERT INTO incidents (coordinates, responder, response_time) VALUES ($1, $2, $3)';
        await client.query(insertIncidentQuery, [coordinates, responder, responseTime]);
        console.log('Incident data inserted into database successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error inserting incident data into database', error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
