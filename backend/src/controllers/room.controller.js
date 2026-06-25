const Room = require('../models/Room.model');
const mongoose = require('mongoose');

exports.getOrCreateInbox = async (req, res, next) => {
    try {
        const { user: userId } = req.body;
        const myId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        if (myId === userId) {
            return res.status(400).json({ message: 'Cannot chat with yourself' });
        }

        let room = await Room.findOne({
            isGroup: false,
            $and: [
                { 'members.user': new mongoose.Types.ObjectId(myId) },
                { 'members.user': new mongoose.Types.ObjectId(userId) },
                { members: { $size: 2 } }
            ]
        }).populate('members.user', 'username avatar isOnline');

        if (!room) {
            room = await Room.create({
                isGroup: false,
                members: [
                    { user: myId },
                    { user: userId }
                ]
            });
            room = await room.populate('members.user', 'username avatar isOnline');
        }

        res.json({ room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyChats = async (req, res, next) => {
    try {
        const rooms = await Room.find({
            'members.user': req.user.id
        })
            .populate('members.user', 'username avatar isOnline')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({ rooms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};