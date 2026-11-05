const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const passportLocalMongoose = require("passport-local-mongoose").default;


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});


userSchema.plugin(passportLocalMongoose);  //it is automaticaly add hasing, salting,..... that's why we use this line 

module.exports = mongoose.model('User', userSchema);