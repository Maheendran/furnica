/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  if (err.status === 404) {
    statusCode = 404;
    errorMessage = 'Not Found';
  } else if (err.status === 403) {
    statusCode = 403;
    errorMessage = 'Forbidden';
  } else if (err.status === 401) {
    statusCode = 401;
    errorMessage = 'Unauthorized';
  }
  res.status(statusCode).render('user/error', { error: errorMessage });
};

module.exports = errorHandler;
