import prisma from "../model/prisma.js";
import sendEmail from "../util/nodemailer.js";
import serverError from "../util/serverError.js";
import generatePassword from "generate-password";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const models = {
      Customer: prisma.customer,
      Vendor: prisma.vendor,
      Admin: prisma.admin,
    };

    // Validate role early
    const selectedModel = models[role];
    if (!selectedModel) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid role specified" });
    }

    // Check email across all roles in parallel
    const [customerExists, vendorExists, adminExists] = await Promise.all([
      prisma.customer.findFirst({ where: { email } }),
      prisma.vendor.findFirst({ where: { email } }),
      prisma.admin.findFirst({ where: { email } }),
    ]);

    if (customerExists || vendorExists || adminExists) {
      const existingIn = customerExists
        ? "Customer"
        : vendorExists
        ? "Vendor"
        : "Admin";
      return res
        .status(409)
        .json({
          status: "error",
          message: `Email already used in ${existingIn}`,
        });
    }

    // Generate username and password
    const totalCustomers = await prisma.customer.count();
    const username = `${name
      .replace(/\s+/g, "")
      .toLowerCase()}${totalCustomers}`;
    const rawPassword =
      "user" +
      generatePassword.generate({
        length: 4,
        numbers: true,
      });

    const encryptedPassword = await bcrypt.hash(rawPassword, 10);

    // Send credentials
    sendEmail(name, email, username, rawPassword);

    // Create user
    await selectedModel.create({
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
      .json({ status: "success", message: `${role} created successfully` });
  } catch (err) {
    serverError(res, "Error occurred at register user", err);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await prisma.admin.findFirst({
      where: {
        OR: [{ email: username }, { username: username }],
      },
    });

    let role = "Admin";

    if (!user) {
      user = await prisma.vendor.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      });
      role = "Vendor";
    }

    if (!user) {
      user = await prisma.customer.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      });
      role = "Customer";
    }

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Login successful", token });

  } catch (err) {
    serverError(res, "Error occurred at loginUser", err);
  }
};


export const logoutUser=async (req,res) => {
  try {
    const {user_token}=req.cookies

    if(!user_token) {
      return res.status(404).json({status:'error',message:'Token not found!'})
    }
    res.clearCookie('user_token',{
      httpOnly:true,
      secure:true,
      sameSite:'None'
    })
    return res.status(200).json({status:"success",message:'Logout successfull'})
  } catch (err) {
    serverError(res,'Logout user ',err)
  }
}
