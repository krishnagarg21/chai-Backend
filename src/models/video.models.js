import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFile: {
        type: String, // url will be recieved
        required: true
    },
    thumbnail: {
        type: String, // url will be recieved
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // cloudinary will provide
        required: true
    },
    view: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user" 
    }

}, {timestamps: true});


videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.Schema.Types.ObjectId("video", videoSchema)