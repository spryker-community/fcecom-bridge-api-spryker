const httpClient = require('../utils/http-client');
const Lookup = require('./LookupUrlService');
const logger = require('../utils/logger');
const { ShopError } = require('fcecom-bridge-commons');

const LOGGING_NAME = 'ProductsService';

const { DEFAULT_LANG } = process.env;

/**
 * This method fetches all products and transforms them into the internal model.
 *
 * @param {number} [categoryId] ID of the category to get products from.
 * @param {string} [keyword] Keyword to filter the products by.
 * @param {string} [lang=DEFAULT_LANG] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return The fetched products.
 */
const productsGet = async (categoryId, keyword, lang = DEFAULT_LANG, page = 1) => {
    // Spryker only allows 12, 24 and 36 as limits
    const _limit = 36;

    const searchParams = new URLSearchParams({
        ...(page && { 'page[offset]': (page - 1) * _limit }),
        'page[limit]': _limit,
        ...(categoryId && { category: categoryId }),
        ...(keyword && { q: keyword }),
        ...{ include: 'abstract-products' }
    });

    const langHeader = {
        'Accept-Language': lang
    };

    logger.logDebug(
        LOGGING_NAME,
        `Performing GET request to /catalog-search with parameters ${searchParams} and lang header ${JSON.stringify(langHeader)}`
    );

    const { data: fullRequestResponse = [] } = await httpClient.get(`/catalog-search?${searchParams}`, {
        headers: langHeader
    });
    const productData = fullRequestResponse.data.find((t) => t.type === 'catalog-search');
    const totalElementFound = productData.attributes.pagination.numFound;
    const hasNext = productData.attributes.pagination.currentPage < productData.attributes.pagination.maxPage;
    const flatProductData = productData.attributes.abstractProducts;

    const products = flatProductData.map((element) => {
        const abstractProduct = fullRequestResponse.included.find((t) => t.id === element.abstractSku);
        Lookup.addToCache(abstractProduct.attributes.url, {
            type: 'product',
            id: abstractProduct.id,
            lang: lang
        });
        return {
            id: element.abstractSku,
            label: element.abstractName,
            extract: abstractProduct.attributes.url,
            image: element.images[0].externalUrlLarge,
            thumbnail: element.images[0].externalUrlSmall
        };
    });

    return { products: products, total: totalElementFound, hasNext: hasNext };
};

/**
 * This method fetches the data for the products with the given IDs.
 * @see SwaggerUI {@link http://localhost:3000/api/#/Products/productsProductIdsGet}
 *
 * @param {string[]} [productIds] IDs of the categories to get.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return Promise<{ hasNext: boolean, total: number, products: any[]}> The category data.
 */
const productsProductIdsGet = async (productIds, lang = DEFAULT_LANG) => {
    const products = (
        await Promise.all(
            productIds.map(async (productId) => {
                try {
                    const searchParams = new URLSearchParams({
                        include: 'abstract-product-image-sets'
                    });

                    const langHeader = {
                        'Accept-Language': lang
                    };

                    logger.logDebug(
                        LOGGING_NAME,
                        `Performing GET request to /abstract-products/${productId} with parameters ${searchParams} and lang header ${JSON.stringify(
                            langHeader
                        )}`
                    );

                    const { data: promisedProduct } = await httpClient.get(`/abstract-products/${productId}?${searchParams}`, {
                        headers: langHeader
                    });
                    if (promisedProduct.errors) {
                        return null; /* return null to make the products filterable in the next step */
                    }
                    const productData = promisedProduct.data;
                    const imageData = promisedProduct.included.find((t) => t.type === 'abstract-product-image-sets');
                    if (productData) {
                        return {
                            id: productData.id,
                            label: productData.attributes.name,
                            extract: productData.attributes.url,
                            image: imageData.attributes.imageSets[0].images[0].externalUrlLarge,
                            thumbnail: imageData.attributes.imageSets[0].images[0].externalUrlSmall
                        };
                    }
                } catch (e) {
                    return null; /* return null to make the products filterable in the next step */
                }
            })
        )
    ).filter(Boolean);

    return { products };
};

/**
 * This method returns the URL for the given product.
 *
 * @param {number|string} productId The ID of the product to get the URL for.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return {{url: string}} The URL of the given product, null if given ID is invalid.
 */
const getProductUrl = async (productId, lang = DEFAULT_LANG) => {
    const langHeader = {
        'Accept-Language': lang
    };
    logger.logDebug(
        LOGGING_NAME,
        `Performing GET request to /abstract-products/${productId} with lang header ${JSON.stringify(langHeader)}`
    );

    const { data = [] } = await httpClient.get(`/abstract-products/${productId}`, {
        headers: langHeader
    });
    const url = data?.data?.attributes?.url;
    if (!url) {
        logger.logError(LOGGING_NAME, `Failed to retrieve URL for product ${productId}, received ${data}`);
        throw new ShopError('Unable to retrieve URL from shop.');
    }
    return {
        url
    };
};

module.exports = {
    productsGet,
    productsProductIdsGet,
    getProductUrl
};
