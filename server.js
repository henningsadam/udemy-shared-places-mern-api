const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
require('dotenv').config();

const DB_CONNECTION_STRING = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@udemy-sharing-places.atzaqq1.mongodb.net/places?retryWrites=true&w=majority&appName=udemy-sharing-places`;

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// Configure security policies by setting headers (e.g. CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  next(new HttpError('Endpoint not found.', 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'Unknown error occured' });
});

mongoose
  .connect(DB_CONNECTION_STRING)
  .then(() => {
    app.listen(3000);
    console.log('Connected on port 3000');
  })
  .catch((error) => {
    console.log(error);
  });
