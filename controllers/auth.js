const User = require('../models/user');
exports.getLogin = (req, res, next) => {
  const cookie = req.get('Cookie');
  console.log(cookie, "cookie")
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  // Secure, HttpOnly => We can not get data to browser, because of security reason.
  // Max-Age=10; set expiration date of cookie
  // res.setHeader('Set-Cookie','loggedIn=true;');
  // res.redirect('/');

  User.findById('6458c070909c760b58f8c944')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect('/');
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
