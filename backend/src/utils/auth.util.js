import { config} from 'dotenv';
config();
import jwt from 'jsonwebtoken';
import ms from 'ms';
import crypto from 'crypto';


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");


const generateAccessToken = (user)=>{
  const accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";
   const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: accessTokenExpiry }
  );
  return accessToken;
}


const generateRefreshToken = (user,rememberMe)=>{
    const refreshTokenExpiry = rememberMe
    ? process.env.JWT_REMEMBER_ME_REFRESH_TOKEN_EXPIRY || "30d"
    : process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d";

    const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: refreshTokenExpiry }
    );

    return refreshToken;
}


export {
    generateOTP,
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
};
