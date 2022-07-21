const httpClient = require('../utils/http-client');
const { extractUri } = require('../utils/url');

// Map to cache content IDs in order to resolve their URLs later.
const urlCache = new Map();

/**
 * This method adds an url to the URL cache.
 *
 * @param {string} url The URL to be added to the cache.
 * @param {{id?: string, type?: string}} metadata The Value to be associated with the url.
 */
const addToCache = (url, metadata) => {
    urlCache.set(extractUri(url), metadata);
};

/**
 * This method checks if a url already has a value associated with it.
 *
 * @param {string} url The url to check.
 * @return {boolean} If the url has a value associated to it.
 */
const cacheHasUrl = (url) => {
    return urlCache.has(extractUri(url));
};

/**
 * This method returns the identifier for the given storefront URL.
 *
 * @param {string} url The storefront URL to look up.
 * @return {{id?: string, type?: string}} The identifier belonging to the given URL.
 */
const lookup = (url) => {
    return urlCache.get(extractUri(url));
};

module.exports = {
    lookup,
    addToCache,
    cacheHasUrl
};
