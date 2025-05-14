import { loginUser, registerUser } from "../controller/userControllers.js";
import express from 'express';
import {verifyUserInputs} from '../middleware/verifyUserCredentials.js'

const routes=express.Router()

routes.post('/register-user',verifyUserInputs,registerUser)
routes.post('/login-user',loginUser)

export default routes