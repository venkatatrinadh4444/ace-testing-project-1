import dotenv from 'dotenv'
import express from 'express'
import dbConnection from './src/db.js'
import userRoutes from './src/routes/userRoutes.js'
import cors from 'cors'

const app=express()

dotenv.config()

const PORT=process.env.PORT

dbConnection()

app.use(express.json())
app.use(cors({origin:"*"}))

app.get('/',(req,res)=> {
    try {
        res.send('<p style="color:green">Server running at localhost:8000 </p><br/> <p style="color:green">This is a testing backend project.</p>')
    } catch (err) {
        res.status(500).json({status:"error",message:"error occured at server"})
    }
})

app.use('/api',userRoutes)

app.listen(PORT,()=> {
    console.log(`Server started and running at ${PORT}`)
})