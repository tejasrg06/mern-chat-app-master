import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        let { message } = req.body;
        let lowerCase = message.toLowerCase();
        let words = message.split(' ');
        let lowerCaseWords = lowerCase.split(' ');

        let sensitiveWords = ['sensitive','sensitive1', 'sens2', 'sensitive3', 'sensitive4']; // Array of sensitive words
        let indices = findCommonItemsWithIndices(lowerCaseWords, sensitiveWords);

        for (let index of indices) {
            // Convert the string to an array of characters
            let wordArray = words[index].split('');
            
            // Replace characters in the middle with '*', keeping the first and last characters
            for (let i = 0; i < wordArray.length; i++) {
                if (i !== 0 && i !== wordArray.length - 1) {
                    wordArray[i] = '*';
                }
            }
            
            // Convert the array back to a string and update the original 'words' array
            words[index] = wordArray.join('');
        }
        message = words.join(" ");

        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json([]);
        }

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

function findCommonItemsWithIndices(array1, array2) {
    let commonItemsIndices = [];

    // Create a Set from array2 for faster lookup
    let set2 = new Set(array2);

    // Iterate over array1 and check if each element exists in array2
    array1.forEach((item, index1) => {
        if (set2.has(item)) {
            // If found in array2, store the index in array1
            commonItemsIndices.push(index1);
        }
    });

    return commonItemsIndices;
}
