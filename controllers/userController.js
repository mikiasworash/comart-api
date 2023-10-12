import asyncHanlder from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc Auth User / Set token
// router POST /api/users/auth
// @access Public
const authUser = asyncHanlder(async (req, res) => {
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

// @desc Register a new user
// router POST /api/users
// @access Public
const registerUser = asyncHanlder(async (req, res) => {
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
const logoutUser = asyncHanlder(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out" });
});

// @desc Get User Profile
// router GET /api/users/profile
// @access Private
const getUserProfile = asyncHanlder(async (req, res) => {
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
const updateUserProfile = asyncHanlder(async (req, res) => {
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
const getVendors = asyncHanlder(async (req, res) => {
  let vendors = await User.find({ role: "vendor" }).select("-password");

  return res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors,
  });
});

// @desc Update Vendor status
// router PUT /api/users/vendors/:id
// @access Private
const updateVendorStatus = asyncHanlder(async (req, res) => {
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
    res.status(200).json({
      success: true,
      data: vendor,
    });
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getVendors,
  updateVendorStatus,
};
