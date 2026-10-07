import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String, // cloudinary url
        required: true,

    },
    coverimage:{
        type: String, // cloudinary url
        required: true,
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String,
        default: null
    },
    
})
UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})
UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}
UserSchema.methods.generateAccessToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_ACCESS_SECRET, {expiresIn: "15m"})
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        }, 
        process.env.ACCESS_TOKEN_EXPIRE, {expiresIn: "1d"})
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        }, 
        process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"})
}

export const User = mongoose.model("User", UserSchema);