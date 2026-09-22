const mongoose = require('mongoose');

const connectDB = async() => {
    await mongoose.connect(
       "mongodb+srv://whoamiguess935_db_user:shivanimodi@hellonode.vvymowz.mongodb.net/DevNexus"
    );
}

module.exports = connectDB;


