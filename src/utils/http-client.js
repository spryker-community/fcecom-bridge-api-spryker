const axios = require('axios');
const logger = require('./logger');

const { SPRYKER_GLUE_LOCATION } = process.env;

const LOGGING_NAME = 'http-client';

const client = axios.create({ baseURL: SPRYKER_GLUE_LOCATION });

let lastError;

client.interceptors.response.use(
    (response) => {
        logger.logInfo(
            LOGGING_NAME,
            `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`
        );
        return response;
    },
    (error) => {
        const { message, response } = (lastError = error);
        const data = response?.data || message;
        const details = response?.data?.detail || message;
        const status = response?.status || 500;
        if (response) {
            logger.logError(
                LOGGING_NAME,
                `↳  Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${
                    response.statusText
                } ${details}`
            );
        } else {
            logger.logError(LOGGING_NAME, `↳ ${message}`);
        }
        return Promise.reject({ error: true, data, status });
    }
);

module.exports = client;
module.exports.getLastError = () => lastError;
