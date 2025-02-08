const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const hospitals = require('./router/hospitals');
const appointments = require('./router/appointments');
const auth = require('./router/auth');
const connectDB = require('./config/db');

dotenv.config({path: './config/config.env'});

connectDB();

const app = express();
app.use(express.json());

app.use(cookieParser());


console.log(process.env.PORT);
const port = process.env.PORT || 5000;

app.use("/api/v1/hospitals", hospitals);
app.use('/api/v1/appointments', appointments);
app.use("/api/v1/auth",auth);

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Logged Error: ${err.message}`);
    server.close(() => process.exit(1));
});