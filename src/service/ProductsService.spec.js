const httpClient = require('../utils/http-client');
const data = require('./ProductsService.spec.data');
const service = require('./ProductsService');

jest.mock('../../src/utils/http-client');

describe('ProductsService', () => {
    describe('productsGet', () => {
        it('fetches product data and maps it to internal type', async () => {
            const categoryId = 10;
            const keyword = 'KEYWORD';
            const lang = 'en';
            const page = 1;

            const expectedProductList = data.fetchProducts.data[0].attributes.abstractProducts;
            const expectedAbstractProductList = data.fetchProducts.included;

            httpClient.get.mockResolvedValue({ data: data.fetchProducts });

            const result = await service.productsGet(categoryId, keyword, lang, page);

            expect(httpClient.get.mock.calls[0][0]).toContain(
                `/catalog-search?page%5Boffset%5D=0&page%5Blimit%5D=36&category=${categoryId}&q=${keyword}`
            );
            expect(result.products.length).toEqual(expectedProductList.length);
            result.products.forEach((product, index) => {
                expect(product.id).toEqual(expectedProductList[index].abstractSku);
                expect(product.label).toEqual(expectedProductList[index].abstractName);
                expect(product.extract).toEqual(expectedAbstractProductList[index].attributes.url);
                expect(product.image).toEqual(expectedProductList[index].images[0].externalUrlLarge);
            });
            expect(result.total).toEqual(data.fetchProducts.data[0].attributes.pagination.numFound);
            expect(result.hasNext).toEqual(
                data.fetchProducts.data[0].attributes.pagination.currentPage < data.fetchProducts.data[0].attributes.pagination.maxPage
            );
        });
    });
    describe('productsProductIdsGet', () => {
        it('fetches product data by ID and maps it to internal type', async () => {
            const testProduct = data.fetchProductsWithId;
            const productIds = [testProduct.data.id, '-999'];
            httpClient.get
                .mockResolvedValueOnce({ data: data.fetchProductsWithId })
                .mockResolvedValue({ data: data.fetchProductsNoProductFound });

            const result = await service.productsProductIdsGet(productIds);

            expect(httpClient.get.mock.calls[0][0]).toContain(
                `/abstract-products/${testProduct.data.id}?include=abstract-product-image-sets`
            );
            expect(result.products.length).toEqual(1);
            /* can check without index since length has to be 1 at this point */
            result.products.forEach((product, index) => {
                expect(product.id).toEqual(testProduct.data.id);
                expect(product.label).toEqual(testProduct.data.attributes.name);
                expect(product.extract).toEqual(testProduct.data.attributes.url);
                expect(product.image).toEqual(testProduct.included[0].attributes.imageSets[0].images[0].externalUrlLarge);
            });
        });
    });
    describe('getProductUrl', () => {
        it('returns the correct URL', async () => {
            const testProduct = data.fetchProductsWithId.data;
            httpClient.get.mockResolvedValue({ data: data.fetchProductsWithId });

            const result = await service.getProductUrl(testProduct.id);

            expect(httpClient.get.mock.calls[0][0]).toEqual(`/abstract-products/${testProduct.id}`);
            expect(result).toEqual({ url: testProduct.attributes.url });
        });
    });
});
