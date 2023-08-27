const express = require("express");
const mongoose = require("mongoose")
const userRoutes =  require('./routes/user.route.js');
const authRoutes = require('./routes/auth.route.js');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors')

mongoose
  .connect('mongodb+srv://pankaj:panki@cluster0.5gajeyj.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });
  

const app = express();

app.use(cors({
  origin : "*"
}))

app.use(express.json());

app.use(cookieParser());

app.listen(8000, () => {
  console.log('Server listening on port 8000');
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
