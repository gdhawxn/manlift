var mongoose = require('mongoose');

var mSchema = new mongoose.Schema({
    sno:String,
    make:String,
    model:String,
    year:Number,
    rival:String,
    catagory:String,
    fuel:String,
    hmeter:String,
    deponame:String,
    breakdowns:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"breakdowns"
        }],
    
});

module.exports = mongoose.model("machines",mSchema);