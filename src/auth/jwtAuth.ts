import { ExtractJwt, Strategy } from 'passport-jwt'
import User from '../db/userModel';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || ''
};

const jwtAuth = new Strategy(jwtOptions, (payload, done) => {
  User.findById(payload.id)
    .then(user => {
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
    .catch(err => {
      done(err, false);
    });
});

export default jwtAuth
