const express = require('express');
const { appendRow } = require('./sheets');
const app = express();
app.use(express.json());//julia - was missing...

const mongoose = require('mongoose');
require('dotenv').config();

const user = encodeURIComponent(process.env.MONGO_ATLAS_USER);
const password = encodeURIComponent(process.env.MONGO_ATLAS_PSWD);
const uri = `mongodb+srv://${user}:${password}@${process.env.MONGO_ATLAS_URI}`;
//mongoose.connect('mongodb+srv://julia:3ZdaIlNPKX6a6y41@clusterprod.adiwniv.mongodb.net/?retryWrites=true&w=majority&appName=ClusterProd');
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


//this (CORS) must be defined before any routes
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));//julia 



const itemRoutes = require('./api/routes/items');
const itemTypesRoutes = require('./api/routes/item-types');


app.use('/items', itemRoutes);
app.use('/item-types', itemTypesRoutes);

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: 'Julia started!!!'
//     });
// });

module.exports = app; 