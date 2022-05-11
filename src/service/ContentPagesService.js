const httpClient = require('../utils/http-client');

const Lookup = require('./LookupUrlService');

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
const contentPagesGet = async (query, lang = DEFAULT_LANG, page = 1) => {
  const pageSize = 20;

  let requestUrl = `/cms-pages`
  if (query) {
    const searchParams = new URLSearchParams({
      q: query
    });
    requestUrl += `?${searchParams}`;
  }

  const { data: fullRequestResponse = [] } = await httpClient.get(requestUrl, {
    headers: {
      'Accept-Language': lang
    }
  });
  fullRequestResponse.data.forEach((contentPage) => {
    Lookup.addToCache(contentPage.attributes.url, {
      type: 'content',
      id: contentPage.id,
      lang: lang
    });
  });
  const contentPages = fullRequestResponse.data.slice((page - 1) * pageSize, page * pageSize).map((contentPage) => {
    return {
      id: contentPage.id,
      label: contentPage.attributes.name,
      extract: contentPage.attributes.url
    }
  });
  const total = fullRequestResponse.data.length;
  const hasNext = page && total > page * pageSize;

  return { contentPages, hasNext, total };
};


/**
 * This method returns the content pages with the given IDs.
 * Will ignore invalid IDs.
 *
 * @param {number[]} contentIds Array of IDs of content pages to get.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return {[*]} The content pages for the given IDs.
 */
const contentPagesContentIdsGet = async (contentIds, lang = DEFAULT_LANG) => {
  const contentPages = (await Promise.all(contentIds.map((contentId) => {
    const searchParams = new URLSearchParams(
    );
    return httpClient.get(`/cms-pages/${contentId}?${searchParams}`, {
      headers: {
        'Accept-Language': lang
      }
    }).then(({ data: promisedContentPage }) => {
      if(promisedContentPage.errors) {
        return;
      }
      const contentPageData = promisedContentPage.data;
      return {
        id: contentPageData.id,
        label: contentPageData.attributes.name,
        extract: contentPageData.attributes.url
      }
    })
    .catch(() => {}) // TODO: fix this with proper error handling
  })))
    .filter(Boolean);

  return { contentPages };
};

/**
 * This method returns the URL belonging to the page with the given ID.
 *
 * @param {number} contentId ID of the page.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return {{url: string}} The URL belonging to the page, null if page ID was invalid.
 */
const getContentUrl = async (contentId, lang = DEFAULT_LANG) => {
  const searchParams = new URLSearchParams(
  );
  const { data } = await httpClient.get(`/cms-pages/${contentId}?${searchParams}`, {
    headers: {
      'Accept-Language': lang
    }
  });
  if(data.errors) {
    return;
  }
  return {
    url: data.data.attributes.url
  }
};

module.exports = {
  contentPagesGet,
  contentPagesContentIdsGet,
  getContentUrl,
};
