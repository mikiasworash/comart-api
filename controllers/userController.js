import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// @desc Auth User / Set token
// router POST /api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user && (await user.matchPassword(password))) {
    if (user.active === "pending") {
      res.status(401);
      throw new Error("Sorry, this account is currently waiting for approval!");
    } else if (user.active === "rejected") {
      res.status(401);
      throw new Error(
        "Sorry, this account is blocked! Consider contacting the administrator."
      );
    }

    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      role: user.role,
      active: user.active,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Forgot Password
// @route   POST /api/users/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error("No user found with that email");
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/users/auth/resetpassword/${resetToken}`;

  const message = `Dear ${user.name},

  You are receiving this email because you have requested the reset of a password. Please click on the following link to reset your password:
  
  ${resetUrl}
  
  If you did not request a password reset or believe this email was sent to you in error, please ignore it. Your account security is important to us.
  
  Best Regards,
  Comart Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      sucess: true,
      data: "Email Sent",
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset Password
// @route   PUT /api/users/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid Token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(res, user._id);
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    photo: user.photo,
    role: user.role,
    active: user.active,
  });
});

// @desc Register a new user
// router POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, photo } = req.body;
  const active = role === "vendor" ? "pending" : "active";

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    photo,
    role,
    active,
  });

  if (user) {
    if (user.role !== "vendor") {
      generateToken(res, user._id);
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      role: user.role,
      active: user.active,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Logout User
// router POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out" });
});

// @desc Get User Profile
// router GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    photo: req.user.photo,
    role: req.user.role,
    active: req.user.active,
  };
  res.status(200).json(user);
});

// @desc Update User Profile
// router PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.photo = req.body.photo || user.photo;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      photo: updatedUser.photo,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

// @desc Get all vendors
// router GET /api/users/vendors
// @access Public
const getVendors = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const offset = (page - 1) * limit;

  let vendors = await User.find({ role: "vendor" })
    .select("-password")
    .skip(offset)
    .limit(limit);

  return res.status(200).json({ vendors });
});

// @desc Update Vendor status
// router PUT /api/users/vendors/:id
// @access Private
const updateVendorStatus = asyncHandler(async (req, res) => {
  let vendor = await User.findById(req.params.id);
  // Make sure vendor exists
  if (!vendor) {
    res.status(400);
    throw new Error("Vendor not found");
  } else {
    vendor = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ vendor });
  }
});

export {
  authUser,
  forgotPassword,
  resetPassword,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getVendors,
  updateVendorStatus,
};
