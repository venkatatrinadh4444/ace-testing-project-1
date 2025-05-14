import serverError from "../util/serverError.js";
import prisma from "../model/prisma.js";

const verifyUserInputs=async (req,res,next)=> {
    try {
        const {name,email}=req.body;
        if(!name || !email) {
            return res.status(404).json({status:'error',message:'Enter valid user details'})
        }
        const user=await prisma.user.findFirst({where:{email}})
        if(user) {
            return res.status(409).json({status:'error',message:'Email already in use'})
        }
        next()
    } catch (err) {
        serverError(res,"verifying user inputs",err)
    }
}

export {verifyUserInputs}