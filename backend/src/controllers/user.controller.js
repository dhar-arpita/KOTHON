const User = require('../models/User.model')


exports.searchUsers = async (req , res , next) =>{
    try{

        const {q} = req.query;

        if(!q) return res.status(400).json({ message: 'Search query required' });


        const users = await User.find({
            $or:[
                {
                    username : { $regex:q ,$options:'i'}

                },

                {
                    mobileNo : { $regex:q , $options:'i'}

                }
            ]
        }).select('username avatar mobileNo isOnline');


        res.json({users})

    }catch(err){
        next(err);
    }
};