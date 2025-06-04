const express = require('express');
const { HTTP_STATUS, STRING_CONSTANTS } = require('../../../shared/constants');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(HTTP_STATUS.OK).json({
        message: "Handling GET requests to /items"
    })
});

router.post('/', (req, res, next) => {
    res.status(HTTP_STATUS.OK).json({
        message: "Handling POST requests to /items"
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