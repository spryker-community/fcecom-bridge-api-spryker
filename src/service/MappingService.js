const ContentPages = require('./ContentService');
const Categories = require('./CategoriesService');
const Products = require('./ProductsService');
const LookupUrlService = require('./LookupUrlService');

const { DEFAULT_LANG } = process.env;

/**
 * This method returns an identifier for a given Storefront URL which is used in FirstSpirit to identify the page.
 *
 * @param {string} url The Storefront URL to look up.
 * @returns {object} The identifier for the given URL.
 */
const lookupUrlGet = async function (url) {
    if (!LookupUrlService.cacheHasUrl(url)) {
        await Promise.all([ContentPages.contentGet(), Products.productsGet(), Categories.categoriesGet()]);
    }
    return LookupUrlService.lookup(url);
};

/**
 * This method returns a Storefront URL which is build out of the given identifier properties in FirstSpirit.
 *
 * @param {string} type The element type.
 * @param {number} id The element's unique identifier.
 * @param {string} [lang=DEFAULT_LANG] The language to localize the label.
 * @returns The Storefront URL belonging to the given element.
 */
const storefrontUrlGet = async function (type, id, lang = DEFAULT_LANG) {
    switch (type) {
        case 'product':
            return Products.getProductUrl(id, lang);
        case 'category':
            return Categories.getCategoryUrl(id, lang);
        case 'content':
        default:
            return ContentPages.getContentUrl(id, lang);
    }
};

module.exports = {
    lookupUrlGet,
    storefrontUrlGet
};
