const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const appRoot = require('app-root-path');


const myFormat = winston.format.printf(log => {
    return `${log.timestamp} ${log.level}: ${log.message}`;
});

module.exports = winston.createLogger( {
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        myFormat
    ),
    transports: [
        new DailyRotateFile({
            name: 'file',
            datePattern: 'YYYYMMDD',
            filename: appRoot + '/logs/full.log'
        }),
        new winston.transports.Console({
            handleExceptions: true,
            format: myFormat
        })
    ],
    exitOnError: false
} );

