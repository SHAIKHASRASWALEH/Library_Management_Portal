import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {Student} from '../models/student.model.js';
import {Admin} from '../models/admin.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { OAuth2Client } from 'google-auth-library';
import { ApiError } from '../utils/ApiError.js';


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google profile:', profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const generateAccessAndRefereshTokens = async (id,role) =>{
    try {

        let user;

        if(role === 'admin'){
            user = await Admin.findById(id);
        }else{
            user = await Student.findById(id);
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const googleLogin = async (req, res) => {
  let role;
  try {
        const { credential } = req.body;
  
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        
        const { sub, email, name } = payload;
  
        const googleId = sub;

	const existingAdmin = await Admin.findOne({ email: email });

        if(existingAdmin != null){

            role = 'admin';
            const admin = await Admin.findOne({email: email});

            const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(admin._id,role);
            
            const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken")
            
            const options = {
                httpOnly: true,
                sameSite: "none",
                secure: true
            }
            
                return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200, 
                        {
                            admin: loggedInAdmin, accessToken, refreshToken, role
                        },
                        "Admin logged In Successfully"
                    )
                )
            
        }

        else if(email.endsWith('@iitrpr.ac.in')){

          const existingStudent = await Student.findOne({
            email: email
          });

          if(existingStudent === null){
            await Student.create({
              email: email,
              name: name,
              dateOfBirth: new Date(),
              gender: 'M',
              password: 'password',
              rollNo: email.split('@')[0],
              department: 'Not set',
              degree: 'Not set',
              phoneNumber: email,

            });
          }
            const student = await Student.findOne({email: email});

            const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(student._id,role);
            
            const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken")
            
            const options = {
                httpOnly: true,
                sameSite: "none",
                secure: true
            }
            
                return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200, 
                        {
                            student: loggedInStudent, accessToken, refreshToken, role
                        },
                        "Student logged In Successfully"
                    )
                )
            
            }
            
        else{
            throw new ApiError(401, "Please login with your IIT Ropar email id")  
          }

        }
        catch (error) {
          console.log('Error verifying Google token:', error);
          res.status(401).json({
            success: false,
            message: error.message || 'Invalid Google token'
          });

        };
        
};

export const googleCallback = [
  passport.authenticate('google', { scope: ['profile', 'email'] }),
  (req, res) => {
    res.redirect('http://localhost:5173/admin');
  }
];
