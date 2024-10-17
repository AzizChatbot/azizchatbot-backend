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
      const { email } = req.body;

      if (email) {
        const emailUsed = await User.findOne({ email });
        if (emailUsed) {
          return res.status(409).json({ message: "Email already in use." });
        }
        req.body.isVerified = false;
      }

      User.findByIdAndUpdate(
        userId,
        { $set: req.body },
        { new: true, runValidators: true }
      );
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

profileRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req: Request["body"], res: Response) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId, { password: 0 });
      return res.json(user);
    } catch {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

export default profileRouter;
