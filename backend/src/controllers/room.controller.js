const Room = require('../models/Room.model')

exports.getOrCreateInbox = async (req,res,next) => {

    try{

    const {user:userId} = req.body;
    
    const myId = req.user.id;


    let ExistedRoom = await Room.findOne({

        isGroup:false,
        members : { $all:[
            {$elemMatch : {user : myId}},
            {$elemMatch : {user : userId}}
        ]
       },
       'members': { $size: 2 }
     

    });

    

    if(!ExistedRoom){
        ExistedRoom = await Room.create({
            isGroup:false,
            members : [
                {user : myId},
                {user : userId}
            ]

        });
    }

    res.json({ExistedRoom});
}catch(err){
    res.json({err});
}
};


exports.getMyChats  = async ( req,res,next) =>{

    const userId  = req.user.id;
    
    try{
        const rooms = await Room.find({

            'members.user':userId
        })
        .populate('members.user','username avatar')
        .populate('lastMessage')
        .sort({updatedAt:-1});

        res.json({rooms})
    }catch(err){
        res.json({err});
    }

};