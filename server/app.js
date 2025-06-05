const express = require('express');
const app = express();

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

app.use(express.json());//julia - was missing...

const itemRoutes = require('./api/routes/items');


app.use('/items', itemRoutes);

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: 'Julia started!!!'
//     });
// });

module.exports = app; 