const mongoose = require("mongoose")
const val = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const Task = require("./task")
const schema = new mongoose.Schema({
    name: {
        type:String,
        trim:true   
    },
    age: {
        type:Number,
        required:true,
        min:18,
        max:99,
        default:18
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate: {
            validator:(v)=>{
                if(!val.isEmail(v)){
                    throw new Error("You must enter a valid email address")
                }
           }
        }
    },
    password:{
        type:String,
        minlength:[7,"Your password must be at least 7 digits long"],
        trim:true,
        required:true,
        validate:{
            validator:(v)=>{
                if(v.toLowerCase().includes("password")){
                    throw new Error("Your password cannot include the word 'password'")
                }
            }
        }

    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

schema.virtual("tasks",{
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
})

schema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}
schema.methods.generateAuthToken = async function (){
    const user = this
    const token= jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    user.save()
    return token
}

schema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        console.log("user not found")
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Unable to log in.")
    }
    return user
}
//remove user tasks when the user is deleted
schema.pre("remove",{document:true,query:false},async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})
//hash plaintext PW before saving
schema.pre("save",async function (){
    const user = this
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,12)
    }    
},{
    timestamps:true
})

const User = mongoose.model("User",schema)

module.exports= User