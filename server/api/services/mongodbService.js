require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = `${process.env.MONGO_DB_CONNECTION}:${process.env.MONGO_DB_PORT}/${process.env.ITEMS_COLLECTION_NAME}`;
console.log("Connecting to MongoDB:", mongoUri);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process if unable to connect
    }
};

module.exports = connectDB;