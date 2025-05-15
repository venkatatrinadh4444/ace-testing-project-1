import { loginUser, registerUser } from "../controller/userControllers.js";
import express from "express";
import {
  validateUser,
  validateEmail,
} from "../middleware/verifyUserCredentials.js";

const routes = express.Router();

routes.post("/register", validateEmail, registerUser);
routes.post("/login", validateUser, loginUser);

export default routes;
