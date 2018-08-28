var mongoose = require('mongoose');

var bdSchema = new mongoose.Schema({
    machine:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"machines"
    },
   site : {
      name : String ,
       address : String 
   } ,
    contact : {
        name : String ,
        phone_number : String
    } ,
    
    fault:{
        category : String ,
        description : String
    },
   parts:[{
       name : String ,
       number : Number 
   }],
    technician : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'users'
    } ,
    job : {
        start_time : String ,
        end_time : String ,
        description : String 
    } ,
    created_at : {
        type : String ,
        default : 0 //TODO
    } ,
   solved:{
        type:Boolean,
       default:false
   },
    completed:{
      type:Boolean,
        default:false
    },
   signature:String,

});

module.exports = mongoose.model("breakdowns",bdSchema); 