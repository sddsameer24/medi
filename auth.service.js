const jwt = require('jsonwebtoken');

//const secret = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'secret';
const secret = 'harimohanchcoco';

  const issue = (payload) => jwt.sign(payload, secret, { expiresIn: 10800 });
  const verify = (token, cb) => jwt.verify(token, secret, {}, cb);


module.exports = issue;
module.exports = verify;
