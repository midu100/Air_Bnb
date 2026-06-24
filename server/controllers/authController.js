const userSchema = require("../models/authSchema");
const uploadToClaudinary = require("../sevices/claudinaryServices");
const sendEmail = require("../sevices/emailServices");
const { generateOTP, generateAccToken, generateRefreshToken } = require("../sevices/helpers");
const { emailVerificationTemp } = require("../sevices/templates");

const signUp = async (req, res) => {
 try {
   const { fullName, email, password, phone, role } = req.body;
  const profileImg = req.file;

  if (!fullName)
    return res.status(400).send({ message: "Fullname is required." });
  if (!email) return res.status(400).send({ message: "Email is required" });
  if (!password)
    return res.status(400).send({ message: "Password is required" });

   
  const existUser = await userSchema.findOne({ email });
  
  let profileImageUrl ;
  if(profileImg){
    const imgRes = await uploadToClaudinary(profileImg,'profileImg')
    console.log(imgRes)
    profileImageUrl = imgRes.secure_url
  }

  if (existUser) return res.status(400).send({ message: "Email already exist." });

  const generateOtp = generateOTP();

  const userData = new userSchema({
    fullName,
    email,
    password,
    profileImg : profileImageUrl,
    phone,
    role,
    otp: generateOtp,
    otpExpire: Date.now() + 5 * 60 * 1000,
  });

  sendEmail({
    email: email,
    subject: "Verify your email.",
    template: emailVerificationTemp,
    item: generateOtp,
  });
  await userData.save();
  res.status(201).send({ message: "Please verify your email." });
 } catch (error) {
  console.log(error)
 }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email) return res.status(400).send({ message: "Invalid request" });
  if(!otp) return res.status(400).send({ message: "Otp is required" });

  const userData = await userSchema.findOne({
    email,
    otp : Number(otp),
    otpExpire : {$gt : Date.now()}
  })

  userData.otp = null
  userData.isVerified = true

  userData.save()

  res.status(200).send({message : 'Verification successfull.'})


};

const signIn = async (req,res)=>{
    try {
        const{email,password} = req.body

        if(!email) return res.status(400).send({message : 'Email is required'})
        if(!password) return res.status(400).send({message : 'Password is required'})

        const existUser = await userSchema.findOne({email})
        if(!existUser) return res.status(400).send({message : 'User Not Registered'})
        if(!existUser.isVerified) return res.status(400).send({message : 'Your email is not verify,please verfy your email.'})

        const matchedPass = await existUser.comparePassword(password)
        if(!matchedPass) return res.status(400).send({message : 'Incorrect password'})

        const accToken = generateAccToken(existUser)
        const refToken = generateRefreshToken(existUser)
        
        res.cookie('X_AS-TOKEN',accToken)
        res.cookie('R_FS-TOKEN',refToken)
        res.status(200).send({message : 'Login Successful.'})


    } 
    
    catch (error) {
      console.log(error)    
    }
}

const getProfile = async(req,res)=>{
  const user = req.user
  if(!user) return res.status(400).send({message : 'Invalid user'})

  const  userData = await userSchema.findByIdAndUpdate(user._id).select('-password -otp -otpExpire')
  console.log(userData)
  res.status(200).send({message : 'Get Profile Success',userData})
  
}

module.exports = { signUp, verifyOtp,signIn,getProfile };
