import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const empSchema = new mongoose.Schema({
    name: String,
    phone_number: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: String ,
    email: {
        type: String,
        required: true
    }
});

empSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) {
        return next();
    }
    bcrypt.hash(user.password, null, null, (err, hash) => {
        if(err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

empSchema.methods.comparePassword = function(password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("employee",empSchema);
