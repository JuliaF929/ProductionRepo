// logger.js
const { createLogger, transports, format } = require('winston');
const { format: dateFnsFormat } = require('date-fns');

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({format: () => dateFnsFormat(new Date(), 'dd-MMM-yyyy, HH:mm:ss') }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/productionServer.log'})
  ],
});

module.exports = logger;
