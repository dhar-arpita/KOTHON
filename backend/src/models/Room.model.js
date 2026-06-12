const mongoose = require('mongoose');


const roomSchema = new mongoose.Schema({
    name:{type:String},
    isGroup:{type:Boolean,default:false},
    members:[
        {
          user:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, 
          joinedAt:{type:Date,default:Date.now},
          nickname:{type:String,default:''},
          isAdmin:{type:Boolean,default:false}

        }
    ],
    isPublic:{type:Boolean,default:false},
    lastMessage:{type:mongoose.Schema.Types.ObjectId,ref:'Message'},
    avatar:{type:String,default:''}
    

},{timestamps:true}
);

module.exports = mongoose.model('Room',roomSchema);