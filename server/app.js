const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const authRoutes = require("./src/routes/authRoutes");
const groupRoutes = require("./src/routes/groupRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(bodyParser.json());

// Swagger Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payment', paymentRoutes);

// const crypto = require('crypto');
// const secret = crypto.randomBytes(64).toString('hex');
// console.log(secret);


// // Error Handling Middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send({ error: 'Something went wrong!' });
//   });  

// Start Server
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}!`)
});