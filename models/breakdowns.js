var mongoose = require('mongoose');

var bdSchema = new mongoose.Schema({
    machine:String,
   date:{
      type:Date,
      default:Date.now
   },
   site_name:String,
   site_address:String,
   phone_number:String,
   fault:String,
   parts:[String],
   solved:{
        type:String,
       default:'un-solved'
   },
   signature:String
});

module.exports = mongoose.model("breakdowns",bdSchema); 