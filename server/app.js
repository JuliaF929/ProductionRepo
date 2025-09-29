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


const itemRoutes = require('./api/routes/items');
const itemTypesRoutes = require('./api/routes/item-types');
const testApplicationsRoutes = require('./api/routes/test-applications');
const parameterDefaultsRoutes = require('./api/routes/parameter-defaults');

app.use('/api/items', require('./api/routes/items'));
app.use('/api/item-types', require('./api/routes/item-types'));
app.use('/api/test-applications', require('./api/routes/test-applications'));
app.use('/api/parameter-defaults', require('./api/routes/parameter-defaults'));

module.exports = app; 