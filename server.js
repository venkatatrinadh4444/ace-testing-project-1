import dotenv from 'dotenv'
import express from 'express'
import dbConnection from './src/db.js'
import cors from 'cors'
import adminRoutes from './src/routes/adminRoutes.js'
import vendorRoutes from './src/routes/vendorRoutes.js'
import customerRoutes from './src/routes/customerRoutes.js'

const app=express()
app.use(express.json())

dotenv.config()

const PORT=process.env.PORT

dbConnection()

app.use(cors({origin:"*"}))

app.get('/',(req,res)=> {
    try {
        res.send('<p style="color:green">Server running at localhost:8000 </p><br/> <p style="color:green">This is a testing backend project.</p>')
    } catch (err) {
        res.status(500).json({status:"error",message:"error occured at server"})
    }
})

app.use('/api/admin',adminRoutes)
app.use('/api/vendor',vendorRoutes)
app.use('/api/customer',customerRoutes)

app.listen(PORT,()=> {
    console.log(`Server started and running at ${PORT}`)
})