const mongoose=require('mongoose')
const StudentSchema=mongoose.Schema({
    name:{
        firstName:{
            type:String,
            required:true
        },
        middleName:{type:String},
        lastName:{
            type:String,
            required:true
        }
    },
    address:{
        street:{
            type:String,required:true
        },
        city:{type:String,required:true},
        state:{type:String,required:true},
        pincode:{type:Number,required:true}
    }
})
module.exports=mongoose.model('Student',StudentSchema)