require('dotenv').config();
const express = require('express');
const db = require('./db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const transactionsRouter = require('./routers/transactions');
const walletsRouter = require('./routers/wallets');
const categoriesRouter = require('./routers/categories');
const notifcationsRouter = require('./routers/notifications');
const printersRouter = require('./routers/printers');
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use('/transactions', transactionsRouter);
app.use('/wallets', walletsRouter);
app.use('/categories', categoriesRouter);
app.use('/notifications', notifcationsRouter);
app.use('/printers', printersRouter);
const DATA_FILE = path.join(__dirname, 'data.json');

const NOTIFICATIONS_FILE = path.join(__dirname, 'notifications.json');

// Endpoint to fetch data
app.get('/data.json', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Endpoint to save data
app.post('/data.json', (req, res) => {
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error writing to data file');
        } else {
            res.status(200).send('Data successfully saved');
        }
    });
});

// Endpoint to fetch notifications
app.get('/notifications.json', (req, res) => {
    fs.readFile(NOTIFICATIONS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notifications file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Endpoint to save notifications
app.post('/notifications.json', (req, res) => {
    const newData = req.body;
    fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error writing to notifications file');
        } else {
            res.status(200).send('notifications successfully saved');
        }
    });
});








// Test route to verify database connection
app.get('/test-db', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT 1');
    res.json({ 
      success: true, 
      message: 'Database connected',
      env: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      env: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
      }
    });
  }
});

const PORT = 3020;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});





