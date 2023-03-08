const httpClient = require('../utils/http-client');
const Lookup = require('./LookupUrlService');
const logger = require('../utils/logger');

const LOGGING_NAME = 'ContentService';

const { DEFAULT_LANG } = process.env;

/**
 * This method returns all content pages.
 * Will also update the cache with the latest values.
 *
 * @param {string} query Query string to search pages for.
 * @param {string} [lang=DEFAULT_LANG] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return {any[]} An array containing all content pages.
 */
const contentGet = async (query, lang = DEFAULT_LANG, page = 1) => {
    const pageSize = 20;

    const langHeader = {
        'Accept-Language': lang
    };

    let requestUrl = `/cms-pages`;
    if (query) {
        const searchParams = new URLSearchParams({
            q: query
        });
        requestUrl += `?${searchParams}`;
    }

    logger.logDebug(LOGGING_NAME, `Performing GET request to ${requestUrl} with lang header ${JSON.stringify(langHeader)}`);

    const { data: fullRequestResponse = [] } = await httpClient.get(requestUrl, {
        headers: langHeader
    });
    fullRequestResponse.data.forEach((contentPage) => {
        Lookup.addToCache(contentPage.attributes.url, {
            type: 'content',
            id: contentPage.id,
            lang: lang
        });
    });
    const content = fullRequestResponse.data.slice((page - 1) * pageSize, page * pageSize).map((contentPage) => {
        return {
            id: contentPage.id,
            label: contentPage.attributes.name,
            extract: contentPage.attributes.url
        };
    });
    const total = fullRequestResponse.data.length;
    const hasNext = page && total > page * pageSize;

    return { content, hasNext, total };
};

/**
 * This method returns the content pages with the given IDs.
 * Will ignore invalid IDs.
 *
 * @param {number[]} contentIds Array of IDs of content pages to get.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return {[*]} The content pages for the given IDs.
 */
const contentContentIdsGet = async (contentIds, lang = DEFAULT_LANG) => {
    const langHeader = {
        'Accept-Language': lang
    };
    const content = (
        await Promise.all(
            contentIds.map(async (contentId) => {
                logger.logDebug(
                    LOGGING_NAME,
                    `Performing GET request to /cms-pages/${contentId} with lang header ${JSON.stringify(langHeader)}`
                );

                try {
                    const { data: promisedContentPage } = await httpClient.get(`/cms-pages/${contentId}`, {
                        headers: langHeader
                    });

                    return promisedContentPage.errors
                        ? null
                        : {
                              id: promisedContentPage.data.id,
                              label: promisedContentPage.data.attributes.name,
                              extract: promisedContentPage.data.attributes.url
                          };
                } catch (e) {
                    return null; /* return null to make them filterable in the next step */
                }
            })
        )
    ).filter(Boolean);

    return { content };
};

/**
 * This method returns the URL belonging to the page with the given ID.
 *
 * @param {number} contentId ID of the page.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return {{url: string}} The URL belonging to the page, null if page ID was invalid.
 */
const getContentUrl = async (contentId, lang = DEFAULT_LANG) => {
    const searchParams = new URLSearchParams();
    const langHeader = {
        'Accept-Language': lang
    };

    logger.logDebug(
        LOGGING_NAME,
        `Performing GET request to /cms-pages/${contentId} with parameters ${searchParams} and lang header ${JSON.stringify(langHeader)}`
    );

    const { data } = await httpClient.get(`/cms-pages/${contentId}?${searchParams}`, {
        headers: langHeader
    });
    if (data.errors) {
        return;
    }
    return {
        url: data.data.attributes.url
    };
};

module.exports = {
    contentGet,
    contentContentIdsGet,
    getContentUrl
};
