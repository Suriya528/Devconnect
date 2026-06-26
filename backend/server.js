const dotenv=require('dotenv')
dotenv.config()
const express=require('express')

const cors=require('cors')
const Connectdb=require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')


Connectdb()
const app=express()
app.use(cors())
app.use(express.json())
app.use('/api/auth',require('./routes/auth'))
app.use('/api/user',require('./routes/userrouter'))
app.use('/api/posts',require('./routes/postrouter'))
app.get('/',(req,res)=>{
    res.json({message:'api is running'})
})
app.use(notFound)
app.use(errorHandler)

const PORT=process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`server running on the port ${PORT}`)
})