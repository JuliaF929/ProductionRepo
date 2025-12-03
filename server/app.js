const express = require('express');
const app = express();
app.use(express.json());//julia - was missing...

//const mongoose = require('mongoose');
require('dotenv').config();

const user = encodeURIComponent(process.env.MONGO_ATLAS_USER);
const password = encodeURIComponent(process.env.MONGO_ATLAS_PSWD);

//this (CORS) must be defined before any routes
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));//julia 


app.use('/api/items', require('./api/routes/items'));
app.use('/api/item-types', require('./api/routes/item-types'));
app.use('/api/test-applications', require('./api/routes/test-applications'));
app.use('/api/parameter-defaults', require('./api/routes/parameter-defaults'));
app.use('/api/item-actions-history', require('./api/routes/item-actions-history'));
app.use('/api/version', require('./api/routes/version'));

module.exports = app; 