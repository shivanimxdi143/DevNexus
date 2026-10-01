const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8']);

const connectDB = async() => {
    await mongoose.connect(
       process.env.MONGO_URI
    );
}

module.exports = connectDB;


