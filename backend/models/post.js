const { text } = require('express')
const mongoose=require('mongoose')
const commentSchema=new mongoose.Schema({
    name:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    text:{
        type:String,
        maxlength:300
    }
})
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
        
    }],
    comments:[commentSchema]
},{timestamps:true})
module.exports=mongoose.model('Post',Postschema)