const userSchema = require("../models/authSchema");
const uploadToClaudinary = require("../sevices/claudinaryServices");
const sendEmail = require("../sevices/emailServices");
const {
  generateOTP,
  generateAccToken,
  generateRefreshToken,
  verifyToken,
  getCookieOptions,
  ACCESS_COOKIE_AGE,
  REFRESH_COOKIE_AGE,
} = require("../sevices/helpers");
const { isValidEmail, isValidPassword } = require("../sevices/regexValidation");
const { emailVerificationTemp, resetPasswordTemp } = require("../sevices/templates");

// Roles a visitor may pick at signup. 'admin' is deliberately absent - it used to be
// taken straight from req.body, so anyone could register themselves as an admin.
const SIGNUP_ROLES = ["guest", "host"];

// ====== Sign Up
const signUp = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    const profileImg = req.file;

    if (!fullName) return res.status(400).send({ message: "Fullname is required." });
    if (!email) return res.status(400).send({ message: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).send({ message: "Invalid Email Address" });
    if (!password) return res.status(400).send({ message: "Password is required" });
    if (!isValidPassword(password)) return res.status(400).send({ message: "Choose a strong password" });

    // Check first so a duplicate signup does not burn a Cloudinary upload
    const existUser = await userSchema.findOne({ email });
    if (existUser) return res.status(400).send({ message: "Email already exist." });

    let profileImageUrl;
    if (profileImg) {
      const imgRes = await uploadToClaudinary(profileImg, "profileImg");
      profileImageUrl = imgRes.secure_url;
    }

    const generateOtp = generateOTP();

    const userData = new userSchema({
      fullName,
      email,
      password,
      profileImg: profileImageUrl,
      phone,
      role: SIGNUP_ROLES.includes(role) ? role : "guest",
      otp: generateOtp,
      otpExpire: Date.now() + 5 * 60 * 1000,
    });

    await userData.save();

    sendEmail({
      email: email,
      subject: "Verify your email.",
      template: emailVerificationTemp,
      item: generateOtp,
    });

    // success
    res.status(201).send({ message: "Please verify your email." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// ====== Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) return res.status(400).send({ message: "Invalid request" });
    if (!otp) return res.status(400).send({ message: "Otp is required" });

    const userData = await userSchema.findOne({
      email,
      otp: Number(otp),
      otpExpire: { $gt: Date.now() },
    });

    // A wrong or expired OTP used to crash the request on userData.otp = null
    if (!userData) return res.status(400).send({ message: "Invalid or expired OTP." });

    userData.isVerified = true;
    userData.otp = undefined;
    userData.otpExpire = undefined;
    await userData.save();

    res.status(200).send({ message: "Verification successfull." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// ====== Sign In - sets httpOnly cookies
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).send({ message: "Email is required" });
    if (!password) return res.status(400).send({ message: "Password is required" });

    // Typed regex checks also stop a payload like { "$gt": "" } matching any user
    if (!isValidEmail(email)) return res.status(400).send({ message: "Invalid email or password." });
    if (typeof password !== "string") return res.status(400).send({ message: "Invalid email or password." });

    const existUser = await userSchema.findOne({ email });
    if (!existUser) return res.status(400).send({ message: "User Not Registered" });
    if (!existUser.isVerified) return res.status(400).send({ message: "Your email is not verify,please verfy your email." });

    const matchedPass = await existUser.comparePassword(password);
    if (!matchedPass) return res.status(400).send({ message: "Incorrect password" });

    const accToken = generateAccToken(existUser);
    const refToken = generateRefreshToken(existUser);

    res.cookie("X_AS-TOKEN", accToken, getCookieOptions(req, ACCESS_COOKIE_AGE));
    res.cookie("R_FS-TOKEN", refToken, getCookieOptions(req, REFRESH_COOKIE_AGE));
    res.status(200).send({ message: "Login Successful." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// ====== Logout - clears cookies, httpOnly ones cannot be cleared from the browser
const logout = async (req, res) => {
  try {
    res.cookie("X_AS-TOKEN", "", { ...getCookieOptions(req), expires: new Date(0) });
    res.cookie("R_FS-TOKEN", "", { ...getCookieOptions(req), expires: new Date(0) });
    res.status(200).send({ message: "Logout successful." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// ====== Refresh Token - the client already called this on 401, it just never existed
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.["R_FS-TOKEN"];
    if (!token) return res.status(401).send({ message: "Missing refresh token" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).send({ message: "Invalid or expired refresh token" });

    const user = await userSchema.findById(decoded._id);
    if (!user) return res.status(401).send({ message: "User no longer exists" });

    res.cookie("X_AS-TOKEN", generateAccToken(user), getCookieOptions(req, ACCESS_COOKIE_AGE));
    res.status(200).send({ message: "Token refreshed." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};


// ====== Forgot Password - sends a reset OTP to the email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).send({ message: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).send({ message: "Invalid Email Address" });

    const user = await userSchema.findOne({ email });
    // Same reply either way so this cannot be used to discover registered emails
    if (!user) return res.status(200).send({ message: "If that email exists, a reset code has been sent." });

    const generateOtp = generateOTP();

    user.otp = generateOtp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    sendEmail({
      email: email,
      subject: "Reset your password.",
      template: resetPasswordTemp,
      item: generateOtp,
    });

    // success
    res.status(200).send({ message: "If that email exists, a reset code has been sent." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// ====== Reset Password - verifies the OTP and sets a new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email) return res.status(400).send({ message: "Email is required" });
    if (!otp) return res.status(400).send({ message: "Otp is required" });
    if (!newPassword) return res.status(400).send({ message: "New password is required" });
    if (!isValidPassword(newPassword)) return res.status(400).send({ message: "Choose a strong password" });

    const user = await userSchema.findOne({
      email,
      otp: Number(otp),
      otpExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send({ message: "Invalid or expired OTP." });

    // Assigning the raw value lets the schema pre('save') hook hash it
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // success
    res.status(200).send({ message: "Password reset successfully. Please login." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// ====== Get Profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ message: "Invalid user" });

    const userData = await userSchema.findById(user._id).select("-password -otp -otpExpire");
    if (!userData) return res.status(404).send({ message: "User not found" });

    res.status(200).send({ message: "Get Profile Success", userData });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = { signUp, verifyOtp, signIn, logout, refreshToken, forgotPassword, resetPassword, getProfile };
