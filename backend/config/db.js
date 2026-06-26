const mongoose=require('mongoose')
const Connectdb=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log('db connected')
        console.log(mongoose.connection.name)
    
    }
    catch(err){
        console.error(err.message);
        process.exit(1)
        
    }
}
module.exports=Connectdb