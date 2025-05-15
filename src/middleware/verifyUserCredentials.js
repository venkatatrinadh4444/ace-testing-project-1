import { body, validationResult } from "express-validator";

export const validateEmail=[
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('role').isIn(["Admin","Vendor","Customer"]).withMessage('Please enter a valid role'),
    (req,res,next)=> {
        const errors=validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({error:errors.array()})
        }
        next();
    }
]

export const validateUser=[
    body('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long'),
    body('role').isIn(["Admin","Vendor","Customer"]).withMessage('Please enter a valid role'),
    (req,res,next)=> {
        const errors=validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({errors:errors.array()})
        }
        next();
    }
]


/* export const validateUser=[
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long'),
    (req,res,next)=> {
        const errors=validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({errors:errors.array()})
        }
        next();
    }
]
 */