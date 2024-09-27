const passportJWT = require('passport-jwt');
const config = require('../config');
const usersController = require('../helpers/users');



let jwtOptions = {
  secretOrKey: config.jwt.secreto,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  usersController
    .obtainUser({ id: jwtPayload.id })
    .then(user => {
      if (!user) {
       console.log(
          `JWT token not valid. User with id ${jwtPayload.id} does not exist.`
        );
        next(null, false);
        return;
      }

      console.log(
        `User ${
          user.username
        } Authentication completed.`
      );
      next(null, user);
    })
    .catch(err => {
      log.error('Error ocurrió al tratar de validar un token.', err);
      next(err);
    });
});
