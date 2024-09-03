const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging purposes
  
    // Set the default error response status code and message
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
      message: err.message, // Send the error message to the client
      // Include the stack trace only in development mode
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  module.exports = errorHandler;
  