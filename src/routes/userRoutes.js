import { loginUser, registerUser , logoutUser, forgetPassword, verifyOtp, updatePassword, gettingUserDetails } from "../controller/userControllers.js";
import express from "express";
import {
  validateUser,
  validateEmail,
} from "../middleware/verifyUserCredentials.js";
import verifyToken from "../middleware/verifyToken.js";

const routes = express.Router();

routes.post("/register", validateEmail, registerUser);
routes.post("/login", validateUser, loginUser);
routes.delete("/logout",logoutUser)
routes.post("/send-otp",forgetPassword)
routes.post("/verify-otp",verifyOtp)
routes.post("/update-password",updatePassword)
routes.get("/fetch-user",verifyToken,gettingUserDetails)

export default routes;
