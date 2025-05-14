import { loginUser, registerUser } from "../controller/userControllers.js";
import express from 'express';
import {verifyUserInputs} from '../middleware/verifyUserCredentials.js'

const routes=express.Router()

routes.post('/register',verifyUserInputs,registerUser)
routes.post('/login',loginUser)

export default routes