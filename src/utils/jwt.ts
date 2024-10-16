import jwt from "jsonwebtoken";

const generateToken = (userId: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const generateAccessToken = (userId: string) => {
  return generateToken(userId, process.env.JWT_SECRET || "", "1h");
};

export const generateRefreshToken = (userId: string) => {
  return generateToken(userId, process.env.JWT_REFRESH_SECRET || "", "30d");
};
