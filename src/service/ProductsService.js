const httpClient = require('../utils/http-client');

const Lookup = require('./LookupUrlService');

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
      ...{include: 'abstract-products'}
   });

   const { data: fullRequestResponse = [], headers = [] } = await httpClient.get(`/catalog-search?${searchParams}`, {
     headers: {
       'Accept-Language': lang
     }
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
       thumbnail: element.images[0].externalUrlSmall,
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
  const products = (await Promise.all(productIds.map((productId) => {
    const searchParams = new URLSearchParams({
      include: 'abstract-product-image-sets'
    })
    return httpClient.get(`/abstract-products/${productId}?${searchParams}`, {
      headers: {
          'Accept-Language': lang
        }
      }
    ).then(({ data: promisedProduct }) => {
      if (promisedProduct.errors) {
        return;
      }
      const productData = promisedProduct.data;
      const imageData = promisedProduct.included
        .find((t) => t.type === 'abstract-product-image-sets');
      if (productData) {
        return {
          id: productData.id,
          label: productData.attributes.name,
          extract: productData.attributes.url,
          image: imageData.attributes.imageSets[0].images[0].externalUrlLarge,
          thumbnail: imageData.attributes.imageSets[0].images[0].externalUrlSmall,
        };
      }
    })
    .catch(() => {}); // TODO: fix this with proper error handling
  })))
    .filter(Boolean)

  return { products };
};

/**
 * This method returns the URL for the given product.
 *
 * @param {number} productId The ID of the product to get the URL for.
 * @param {string} [lang=DEFAULT_LANG] The ISO shorthand of the language for the request (i.E 'en').
 * @return {{url: string}} The URL of the given product, null if given ID is invalid.
 */
const getProductUrl = async (productId, lang = DEFAULT_LANG) => {
  const { data = [] } = await httpClient.get(`/abstract-products/${productId}`, {
    headers: {
      'Accept-Language': lang
    }
  });

  return {
    url: data.data.attributes.url
  }
};

module.exports = {
  productsGet,
  productsProductIdsGet,
  getProductUrl
};