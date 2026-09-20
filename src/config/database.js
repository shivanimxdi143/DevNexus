const mongoose = require('mongoose');

const connectDB = async() => {
    await mongoose.connect(
       "mongodb+srv://whoamiguess935_db_user:Shivani1234@hellonode.vvymowz.mongodb.net/DevNexus"
    );
}

module.exports = connectDB;

