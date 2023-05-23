/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/extensions */
/* eslint-disable no-console */
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./mongodb/mongoconnect.js');
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute.js');

const app = express();
app.use(cors());
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: 'strict',
      maxAge: 100000000,
    },
  }),
);
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/furnica/admin', adminRoute);
app.use('/furnica', userRoute);

app.use((req, res, next) => {
  
  res.render('user/error', { error: 'Not Found' });
});

connectDB();
app.listen(3000, () => {
  console.log('port is connected');
});
