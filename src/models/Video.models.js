import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from
"mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema({
   videoFile:{
    type: String, // cloudinary url
    required: true,
   },
   Thumbnail:{
    type: String, // cloudinary url
    required: true,
   },
   title:{
    type: String,
    required: true,
   },
   description:{
    type: String,
    required: true,
   },
   duration:{
    type: String,
    required: true,
   },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: false
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
},
{timestamp: true});

videoSchema. plugin (mongooseAggregatePaginate)


export const Video = mongoose.model("Video", VideoSchema);
