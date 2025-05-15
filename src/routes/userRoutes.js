import { loginUser, registerUser , logoutUser } from "../controller/userControllers.js";
import express from "express";
import {
  validateUser,
  validateEmail,
} from "../middleware/verifyUserCredentials.js";

const routes = express.Router();

routes.post("/register", validateEmail, registerUser);
routes.post("/login", validateUser, loginUser);
routes.delete("/logout",logoutUser)

export default routes;
