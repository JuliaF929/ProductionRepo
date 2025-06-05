const express = require('express');
const { HTTP_STATUS, STRING_CONSTANTS } = require('../../../shared/constants');
const router = express.Router();
const mongoose = require('mongoose');

const Item = require('../models/items');

router.get('/', (req, res, next) => {
    Item.find()
    .exec()
    .then (docs => {
        console.log(docs);
        res.status(HTTP_STATUS.OK).json(docs);
    })
    .catch(err => {
        console.log(err);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: err
        });
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

        res.status(HTTP_STATUS.CREATED).json({
            message: "Handling POST requests to /items",
            createdItem: item
        });
    }).catch(err =>{
        console.log(err);
        res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
            error: err
        });
    })
    
});

router.get('/:itemSN', (req, res, next) => {
    const sn = req.params.itemSN;
    Item.findOne({ serialNumber: sn })
    .exec()
    .then(doc => {
        console.log(doc);
        if (doc) /*not null*/{
            res.status(HTTP_STATUS.OK).json(doc)
        } else {
         res.status(HTTP_STATUS.NOT_FOUND).json({message: `Item with ${sn} was not found.`})   
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({error: err});
    });
});

module.exports = router;