const dotenv=require('dotenv')
dotenv.config()
const express=require('express')


const Connectdb=require('./config/db')


Connectdb()
const app=express()
app.use(express.json())
app.use('/student/auth',require('./routes/auth'))
app.use('/student/user',require('./routes/userrouter'))
app.get('/',(req,res)=>{
    res.json({message:'api is running'})
})
app.use((req,res)=>[
    res.status(404).json({message:'route not found'})
])

const PORT=process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log('connected')
})