const bcrypt = require('bcrypt');

const password = 'Souvik09Admin';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hashed password:', hash);
});
