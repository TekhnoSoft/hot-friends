const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const http = require('http');

app.use(cors({
    origin: '*'
}));
 
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Servir arquivos estáticos da pasta upload
app.use('/users/image', express.static(path.join(__dirname, 'upload')));

const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');

app.use('/users', userRoute);
app.use('/posts', postRoute);

var httpServer = http.createServer(app);
httpServer.listen(process.env.PORT);