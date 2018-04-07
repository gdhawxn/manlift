import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const SmsSchema = new mongoose.Schema({
    name: String,
    mobno: String,
    token: {
        type: String,
        required: true
    },
    expired : {
        type : Boolean ,
        default : false
    } ,
    completed : {
        type : Boolean ,
        default : false
    } ,
    station : {
        type : String 
    } ,
    response : {
        rating : String ,
        comment : String
    } ,
    sent : {}
});

export default mongoose.model('SMS', SmsSchema);
