const express = require('express');
const { HTTP_STATUS, STRING_CONSTANTS } = require('../../../shared/constants');
const router = express.Router();
const mongoose = require('mongoose');

const Item = require('../models/items');

router.get('/', (req, res, next) => {
    res.status(HTTP_STATUS.OK).json({
        message: "Handling GET requests to /items"
    })
});

router.post('/', (req, res, next) => {
    const item = new Item({
        _id: new mongoose.Types.ObjectId(),
        serialNumber: req.body.serialNumber,
        name: req.body.name

    });
    item.save().then(result => {
        console.log(result);
    }).catch(err =>{
        console.log(err);
    })
    res.status(HTTP_STATUS.CREATED).json({
        message: "Handling POST requests to /items",
        createdItem: item
    })
});

router.get('/:itemSN', (req, res, next) => {
    const itemSN = req.params.itemSN;
    if (itemSN == 'realSNForItem') {
        res.status(HTTP_STATUS.OK).json({
            message: 'This is really realSNForItem',
            id: itemSN
        });
    } else {
        res.status(HTTP_STATUS.OK).json({
            message: 'Kukuriku'
        });
    }
});

module.exports = router;