const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const app = express();

const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/user',
  collection: 'sessions'
});

store.on('error', function (error) {
  console.log(error);
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));

// file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + '-' + file.originalname);
  }
});

// file filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// for file upload
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));

// static serving file image
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'my secret',
    resave: true,
    saveUninitialized: true,
    store: store
  })
)

app.use(csrfProtection);
app.use(flash())

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

// error handling middleware
app.use((error, req, res, next) => {
  res.redirect('/500');
});

mongoose
  .connect(
    'mongodb://localhost:27017/user',
    {useNewUrlParser: true, useUnifiedTopology: true})
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
