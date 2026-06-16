const express=require('express')
const app=express()
const users=require('./routes/users')
app.use(express.json())
app.use('/users',users)

const port=3000;
app.listen(port,()=>{
    console.log('running')
})