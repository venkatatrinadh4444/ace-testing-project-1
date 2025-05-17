import jwt from 'jsonwebtoken'

const verifyToken=(req,res,next)=> {
    const {user_token}=req.cookies;
    
    if(!user_token) {
        return res.status(404).json({status:'error',message:'Token not found!'})
    }

    const decoded=jwt.verify(user_token,process.env.JWT_SECRET)

    if(!decoded) {
        return res.status(404).json({status:'error',message:'Invalid or expired token'})
    }

    req.id=decoded.id
    req.role=decoded.role
    next()
}

export default verifyToken