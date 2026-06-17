const express=require('express')
const dotenv=require('dotenv')
const Connectdb=require('./config/db')

dotenv.config()
Connectdb()
const app=express()
app.use(express.json())
const student=require('./routes/routes')
app.use('/student',student)
const PORT=process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log('connected')
})