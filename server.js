import dotenv from 'dotenv'
import express from 'express'
import dbConnection from './src/db.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoutes from './src/routes/userRoutes.js'

const app=express()
app.use(express.json())

dotenv.config()

const PORT=process.env.PORT

dbConnection()

app.use(cookieParser())
app.use(cors({origin:["https://ace-testing-project-1-frontend.vercel.app","http://localhost:5173"],credentials:true}))

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