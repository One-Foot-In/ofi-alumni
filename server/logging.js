const winston = require('winston');

const logFormat = winston.format.printf(info => {
    return `${info.timestamp} ${info.level && info.level.toUpperCase()}: ${info.message}`
})

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
})

module.exports = logger
  