const express = require('express');
const app = express();

const itemRoutes = require('./api/routes/items');

app.use('/items', itemRoutes);

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: 'Julia started!!!'
//     });
// });

module.exports = app; 