const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    name:{
        type:String,
        // required:true
    },
    phone: {
    type: String,
    required: false, 
    unique: false,  
    default: ""
},
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    images:[
        {
            type:String
        }
    ],
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String
    },
    otpExpires:{
        type:Date
    },
    date:{
        type: Date,
        default: Date.now
    },
},{timeStamps:true})

userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals:true,
});

exports.User=mongoose.model('User', userSchema);
exports.UserSchema=userSchema;