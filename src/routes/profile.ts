import { Router, Request, Response } from "express";

import { validateData } from "../middleware/validationMiddleware";
import { updateUserInfoSchema } from "../schemas/profileSchema";

import passport from "passport";

import User from "../db/userModel";

const profileRouter: Router = Router();

profileRouter.put(
  "/",
  validateData(updateUserInfoSchema),
  passport.authenticate("jwt", { session: false }),
  async (req: Request["body"], res: Response) => {
    try {
      const userId = req.user._id;
      const { name, email } = req.body;

      const updateData: { [key: string]: any } = {};

      if (name) {
        updateData.name = name;
      }

      if (email) {
        const emailUsed = await User.findOne({ email });
        if (emailUsed) {
          return res.status(409).json({ message: "Email already in use." });
        }
        updateData.email = email;
        updateData.isVerified = false;
      }

      User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { runValidators: true }
      );

      return res.json({ message: "User updated successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

profileRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req: Request["body"], res: Response) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId, { password: 0, __v: 0 });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

export default profileRouter;
