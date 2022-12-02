const axios = require('axios');
const logger = require('./logger');

const { SPRYKER_GLUE_LOCATION } = process.env;
const client = axios.create({ baseURL: SPRYKER_GLUE_LOCATION });

let lastError;

client.interceptors.response.use(
    (response) => {
        logger.logInfo(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`);
        return response;
    },
    (error) => {
        const { message, response } = (lastError = error);
        const data = response?.data || message;
        const details = response?.data?.detail || message;
        const status = response?.status || 500;
        if (response) {
            logger.logError(
                ` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${
                    response.statusText
                }\n\t${details}`
            );
        } else {
            logger.logError(` ↳ ${message}`);
        }
        return Promise.reject({ error: true, data, status });
    }
);

module.exports = client;
module.exports.getLastError = () => lastError;
