const http = require('http');
const os = require('os');
const app = require('./app');
const logger = require('./logger');
const connectDB = require('./api/services/mongodbService');
const { version } = require('./package.json');

const port = process.env.PORT || 5000;

const server = http.createServer(app);
server.listen(port, () => {
    const ipAddress = getLocalIpAddress();
    const rootDir = process.cwd();
  
    logger.info('*************************** New server instance starting ******************');
    logger.info(`Server version ${version} started`);
    logger.info(`Root directory: ${rootDir}`);
    logger.info(`Running on http://${ipAddress}:${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Connect to MongoDB
connectDB();
   
  // Helper to get local IP
  function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const ifaceInfo of iface) {
        if (ifaceInfo.family === 'IPv4' && !ifaceInfo.internal) {
          return ifaceInfo.address;
        }
      }
    }
    return 'localhost';
  }

