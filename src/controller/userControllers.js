import prisma from "../model/prisma.js";
import { sendEmail, sendForgetPasswordOtp } from "../util/nodemailer.js";
import serverError from "../util/serverError.js";
import generatePassword from "generate-password";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

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
      return res.status(409).json({
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

    const [adminExists,vendorExists,customerExists]=await Promise.all([
      prisma.admin.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
      prisma.vendor.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
      prisma.customer.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
    ])

    const user=adminExists || vendorExists || customerExists

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role:user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 60 * 60 * 1000,
    });

    const userDetails={...user,expiresIn:user.expiresIn.toString()}

    return res
      .status(200)
      .json({ status: "success", message: "Login successful", userDetails});
  } catch (err) {
    serverError(res, "Error occurred at loginUser", err);
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { user_token } = req.cookies;

    if (!user_token) {
      return res
        .status(404)
        .json({ status: "error", message: "Token not found!" });
    }
    res.clearCookie("user_token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res
      .status(200)
      .json({ status: "success", message: "Logout successfull" });
  } catch (err) {
    serverError(res, "Logout user ", err);
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { username } = req.body;

    const [adminExists, vendorExists, customerExists] = await Promise.all([
      prisma.admin.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      }),
      prisma.vendor.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      }),
      prisma.customer.findFirst({
        where: {
          OR: [{ email: username }, { username: username }],
        },
      }),
    ]);

    if (!adminExists && !vendorExists &&!customerExists) {
      return res
        .status(404)
        .json({ status: "error", message: "No user found!" });
    }

    const otp = otpGenerator.generate(6, {
      specialChars: false,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
    });
    const expiresIn = Date.now() + 2 * 60 * 1000;

    const user=adminExists || vendorExists || customerExists

    sendForgetPasswordOtp(user.email,otp)

    const models= {
      Admin:prisma.admin,
      Vendor:prisma.vendor,
      Customer:prisma.customer
    }

    const selecteModel=models[user.role]

    await selecteModel.update({
      where:{email:user.email},
      data:{
        otp:Number(otp),
        expiresIn
      }
    })

    return res.status(200).json({status:'success',message:'OTP sent successfully!'})

  } catch (err) {
    serverError(res, "forgetting password", err);
  }
};

export const verifyOtp=async (req,res)=> {
  try {
    const {username,otp}=req.body;
    if(!username || !otp) {
      return res.status(404).json({status:'error',message:'Please enter valid input'})
    }
    const [adminExists,vendorExists,customerExists]=await Promise.all([
      prisma.admin.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
      prisma.vendor.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
      prisma.customer.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }})
    ])

    const user=adminExists || vendorExists || customerExists

    if(!user) {
      return res.status(404).json({status:'error',message:'user not found!'})
    }
    if(user.otp!==Number(otp) || Date.now() > user.expiresIn) {
      return res.status(400).json({status:'error',message:'OTP is invalid or expired'})
    }
    const model={
      Admin:prisma.admin,
      Vendor:prisma.vendor,
      Customer:prisma.customer
    }
    const selectedModel=model[user.role]

    await selectedModel.update({
      where:{email:user.email},
      data:{
        otp:null,
        expiresIn:null
      }
    })
    return res.status(200).json({status:'success',message:'OTP verified successfully!'})
  } catch (err) {
    serverError(res,'verifying otp',err)
  }
}

export const updatePassword = async (req,res) => {
  try {
    const {username,password}=req.body;

    const [adminExists,vendorExists,customerExists]=await Promise.all([
      prisma.admin.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
      prisma.vendor.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }}),
      prisma.customer.findFirst({where:{
        OR :[
          {email:username},{username:username}
        ]
      }})
    ])
    const user=adminExists || vendorExists || customerExists

    if(!user) {
      return res.status(404).json({status:'error',message:'user not found!'})
    }

    const model={
      Admin:prisma.admin,
      Vendor:prisma.vendor,
      Customer:prisma.customer
    }
    const selectedModel=model[user.role]

    await selectedModel.update({
      where:{email:user.email},
      data:{
        password:await bcrypt.hash(password,10)
      }
    })

    return res.status(201).json({status:'successs',message:'Password changed successfully!'})

  } catch (err) {
    serverError(res,'updating passsword',err)
  }
}

export const gettingUserDetails= async (req,res) => {
  try {
    const {id,role}=req;
    const model={
      Admin:prisma.admin,
      Vendor:prisma.vendor,
      Customer:prisma.customer
    }
    const selectedModel=model[role]

    const user=await selectedModel.findUnique({where:{id}})

    if(!user) {
      return res.status(404).json({status:'error',message:'user not found!'})
    }
    const userDetails={...user,expiresIn:user.expiresIn.toString()}
    return res.status(200).json({status:'success',userDetails})
  } catch (err) {
    serverError(res,'fetching user ',err)
  }
}
