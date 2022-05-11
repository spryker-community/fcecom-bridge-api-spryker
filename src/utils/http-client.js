const axios = require('axios');

const { SPRYKER_GLUE_LOCATION } = process.env;
const client = axios.create({ baseURL: SPRYKER_GLUE_LOCATION });

let lastError;

client.interceptors.response.use(
  (response) => {
    console.log(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    const { message, response } = (lastError = error);
    const details = response?.data?.detail || message;
    if (response) {
      console.error(` ↳ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}\n\t${details}`);
    } else {
      console.error(` ↳ ${message}`);
    }
    return Promise.reject({ error: true, message: details });
  }
);

module.exports = client;
module.exports.getLastError = () => lastError;
