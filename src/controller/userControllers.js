import prisma from "../model/prisma.js";
import sendEmail from "../util/nodemailer.js";
import serverError from "../util/serverError.js";
import generatePassword from "generate-password";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await prisma.customer.findFirst({ where: { email } });
    const vendor = await prisma.vendor.findFirst({ where: { email } });
    const admin = await prisma.admin.findFirst({ where: { email } });
    if (user) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already used in Customer" });
    }
    if (vendor) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already used in vendor" });
    }
    if (admin) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already used in Admin" });
    }
    const totalValue = await prisma.customer.count();
    const username = name.split(" ").join("").toLowerCase() + totalValue;
    const password =
      "user" +
      generatePassword.generate({
        length: 4,
        numbers: true,
      });
    sendEmail(name, email, username, password);
    const encryptedPassword = await bcrypt.hash(password, 10);

    if(role==="Admin") {
      await prisma.admin.create({
        data: {
          name,
          email,
          role,
          username,
          password: encryptedPassword,
        },
      });
      return res
      .status(201)
      .json({ status: "success", message: "Admin created successfully" });
    }

    if(role==="Vendor") {
      await prisma.vendor.create({
        data: {
          name,
          email,
          role,
          username,
          password: encryptedPassword,
        },
      });
      return res
      .status(201)
      .json({ status: "success", message: "Vendor created successfully" });
    }

    if(role==="Customer") {
      await prisma.customer.create({
        data: {
          name,
          email,
          role,
          username,
          password: encryptedPassword,
        },
      });
      return res
      .status(201)
      .json({ status: "success", message: "Customer created successfully" });
    }
  } catch (err) {
    serverError(res, "Error occured at register user", err);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password , role } = req.body;

    if(role==="Admin") {
      const user = await prisma.admin.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      });

      const decrptedPassword=await bcrypt.compare(password, user.password)
    if (!user || !decrptedPassword) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json({ status: "success", message: "login successfull", token });
    }

    if(role==="Vendor") {
      const user = await prisma.vendor.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      });

      const decrptedPassword=await bcrypt.compare(password, user.password)
    if (!user || !decrptedPassword) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json({ status: "success", message: "login successfull", token });
    }
    
    if(role==="Customer") {
      const user = await prisma.customer.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      });

      const decrptedPassword=await bcrypt.compare(password, user.password)
    if (!user || !decrptedPassword) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json({ status: "success", message: "login successfull", token });
    }
    
  } catch (err) {
    serverError(res, "Error occured at login user ", err);
  }
};
