const mongoose=require('mongoose')
const Postschema=new mongoose.Schema({
    name:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    text:{
        type:String,
        required:true,
        maxlength:500
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        
    }]
},{timestamps:true})
module.exports=mongoose.model('Post',Postschema)