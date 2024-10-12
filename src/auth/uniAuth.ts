import { Strategy } from "passport-google-oauth20";
import usersModel from "../db/usersModel";

const authOptions = {
  clientID: process.env.UNI_CID || "",
  clientSecret: process.env.UNI_SECRET || "",
  callbackURL:
    `${process.env.CLIENT_URL}/api/auth/login/university/callback` || "",
  scope: ["profile", "email", "openid"],
};

const uniAuth = new Strategy(
  authOptions,
  async (accessToken, refreshToken, profile, done) => {
    if (!profile.emails) {
      return done(new Error("No emails found"), false);
    }
    const user = await usersModel.findOne({ email: profile.emails[0].value });
    if (user) {
      return done(null, user);
    }
    const newUser = await usersModel.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      isVerified: true,
    });
    return done(null, newUser);
  }
);

export default uniAuth;
