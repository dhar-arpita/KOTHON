//moongoose is a library that sits on to top of mongoDB and provides a higher level of abstraction for working with the database. 
//It allows us to define schemas for our data, which can help ensure that our data is consistent and valid. 
// Mongoose also provides a number of built-in methods for querying and manipulating data, making it easier to work with MongoDB in a Node.js application.
//helps to create structured data,validation (emal,password),easy querying(user,created,user.findOne,user,find,user.findById,user.findByIdandUpdate)
//ODM (Object Document Mapper) is a development tool that translates database documents into native code objects.

//User Schema

//const userSchema = new mongoose.Schema({

//});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,unique:true,sparse:true},
    mobileNo:{type:String,required:true,unique:true},
    password:{type:String,required:true,select:false},
    lastseen:{type:Date,default:Date.now},
    isOnline:{type:Boolean,default:false},
    avatar:{type:String,default:''},
    dateofBirth:{type:Date},
    nickname:{type:String},
    bio:{type:String}



},{timestamps:true
});

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return ;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    
});


module.exports = mongoose.model('User', userSchema);

