const appRoot = require('app-root-path');
const express = require('express');
const app = express();
const winston = require(`${appRoot}/winston`);
const router = require(`${appRoot}/router`);

winston.info("Starting Server");
app.use(express.urlencoded());
app.use(router);

var PORT = '8080';
app.listen(PORT, () => {
    winston.info('Port in use ('+ PORT +')');
});