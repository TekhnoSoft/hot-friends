const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');

app.use(cors({
    origin: '*'
}));
 
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const usersRoute = require('./routes/userRoute');

app.use('/users', usersRoute);

var httpServer = http.createServer(app);
httpServer.listen(process.env.PORT);