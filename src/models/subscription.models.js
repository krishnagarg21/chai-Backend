import mongoose, { Schema }  from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, //one who is subscribing
        ref: "user"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true});


export const subscription = mongoose.model("subscription", subscriptionSchema);