import { Router, Request, Response } from "express";

import { validateData } from "../middleware/validationMiddleware";
import { userLoginSchema } from "../schemas/authSchema";

import User from "../db/userModel";

import { compare } from "bcrypt";

import passport from "passport";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const loginRouter: Router = Router();

loginRouter.post(
  "/password",
  validateData(userLoginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ message: "User doesn't exists." });
      }
      if (!user.password) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      compare(password, user.password, (err, correctPassword) => {
        if (!correctPassword) {
          return res.status(401).json({ message: "Invalid credentials." });
        }
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        return res.json({ accessToken, refreshToken });
      });
    } catch {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

loginRouter.get(
  "/university",
  passport.authenticate("google", { hd: "stu.kau.edu.sa", session: false })
);

loginRouter.get(
  "/university/callback",
  passport.authenticate("google", {
    session: false,
  }),
  function (req: Request["body"], res: Response) {
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken(req.user._id);
    return res.json({ accessToken, refreshToken });
  }
);

export default loginRouter;
