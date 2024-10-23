import jwt from "jsonwebtoken";

const generateToken = (userId: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const generateAccessToken = (userId: string) => {
  return generateToken(userId, process.env.JWT_SECRET || "", process.env.JWT_ExpiresIn || "15m");
};

export const generateRefreshToken = (userId: string) => {
  return generateToken(userId, process.env.JWT_REFRESH_SECRET || "", process.env.JWT_REFRESH_ExpiresIn || "30d");
};
