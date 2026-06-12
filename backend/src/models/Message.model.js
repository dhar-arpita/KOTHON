const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  
    sender:{type:mongoose.Schema.Types.ObjectId , ref:'User',required:true},
    content:{type:String,required:true},
    room:{type:mongoose.Schema.Types.ObjectId,ref:'Room',required:true},
    status:{type:String,enum:['sent','delivered','read'],default:'sent'},
    readBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    type:{type:String,enum:['text','image','file'],default:'text'}

},{timestamps:true
});

module.exports = mongoose.model('Message',messageSchema);