import prisma from "../model/prisma.js";
import sendEmail from "../util/nodemailer.js";
import serverError from "../util/serverError.js";
import generatePassword from 'generate-password'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const registerUser=async(req,res)=> {
    try {
        const {name,email,role}=req.body;
        const totalValue=await prisma.user.count()
        const username=name.split(' ').join('').toLowerCase()+"user"+totalValue
        const password="user"+generatePassword.generate({
            length:8,
            numbers:true,
            lowercase:true,
            uppercase:true
        })
        sendEmail(name,email,username,password)
        const encryptedPassword=await bcrypt.hash(password,10)

        await prisma.user.create({
            data:{
                name,
                email,
                role,
                username,
                password:encryptedPassword
            }
        })
        return res.status(201).json({status:'success',message:'User created successfully'})
    } catch (err) {
        serverError(res,"Error occured at register user",err)
    }
}


const loginUser=async (req,res)=> {
    try {
        const {username,password}=req.body;

        const user=await prisma.user.findFirst({where: {
            OR: [
                {email:username},
                {username:username}
            ]
        }   
        });
        if(!user || !await bcrypt.compare(password,user.password)) {
            return res.status(404).json({status:'error',message:'Invalid credentials'})
        }
        const token=jwt.sign({id:user.id,role:user.role,name:user.name,email:user.email},process.env.JWT_SECRET,{expiresIn:'1h'})

        return res.status(200).json({status:'success',message:'login successfull',token})

    } catch (err) {
        serverError(res,"Error occured at login user ",err)
    }
}

export {registerUser,loginUser}