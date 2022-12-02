const httpClient = require('../utils/http-client');
const data = require('./CategoriesService.spec.data');
const service = require('./CategoriesService');

jest.mock('../../src/utils/http-client');

describe('CategoriesService', () => {
    describe('getCategoryUrl', () => {
        it('returns the URL of the given category', async () => {
            const testCategory = data.categoriesGetParentId.data;
            httpClient.get.mockResolvedValue({ data: data.categoriesGetParentId, status: 200 });

            const result = await service.getCategoryUrl(testCategory.attributes.nodeId);

            expect(result).toEqual({ url: testCategory.attributes.url });
            expect(httpClient.get.mock.calls[0][0]).toEqual('/category-nodes/' + testCategory.attributes.nodeId);
        });
        it('returns null if the given category is invalid', async () => {
            console.error = jest.fn();
            httpClient.get.mockResolvedValue({ data: data.categoriesGetParentIdError, status: 200 });

            const result = await service.getCategoryUrl(-999);

            expect(result).toEqual(null);
            expect(console.error).toHaveBeenCalled();
        });
        it('throws an error when http call fails', async () => {
            const errorResponseText = "error"
            const errorResponseStatus = 404
            const errorResponse = { data: errorResponseText, status: errorResponseStatus }
            httpClient.get.mockResolvedValue(errorResponse);

            try {
                await service.getCategoryUrl(123);
            }
            catch (error) {
                expect(errorResponse).toEqual(error)
            }
        });
    });
    describe('categoriesGet', () => {
        it('returns the categories as list (no parent ID, no pagination)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet, status: 200 });

            const result = await service.categoriesGet();

            expect(httpClient.get.mock.calls[0][0]).toEqual('/category-trees');
            expect(result.categories.length).toEqual(data.categoryIdsList.length);
            for (let i = 0; i < data.categoryIdsList; i++) {
                // Check if every category from the test data set is present in the result (ignore ordering)
                expect(result.categories.findIndex((category) => category.id === data.categoryIdsList[i]) !== -1).toEqual(true);
            }
            expect(result.hasNext).toEqual(false);
            expect(result.total).toEqual(data.categoryIdsList.length);
        });
        it('returns the categories as list (with parent ID)', async () => {
            const testCategory = data.categoriesGet.data[0].attributes.categoryNodesStorage[0];
            httpClient.get.mockResolvedValue({ data: data.categoriesGetParentId, status: 200 });

            const result = await service.categoriesGet(testCategory.nodeId);

            expect(httpClient.get.mock.calls[0][0]).toEqual('/category-nodes/' + testCategory.nodeId);
            expect(result.categories.length).toEqual(3);
            expect(result.categories[0].id).toEqual(6);
            expect(result.categories[1].id).toEqual(7);
            expect(result.categories[2].id).toEqual(8);
        });
        it('returns the categories as list (with pagination)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet, status: 200 });

            const result = await service.categoriesGet(undefined, 'EN', 123);

            expect(httpClient.get.mock.calls[0][0]).toEqual('/category-trees');
            expect(result.categories.length).toEqual(0);
            expect(result.hasNext).toEqual(false);
            expect(result.total).toEqual(data.categoryIdsList.length);
        });
    });
    describe('categoryTreeGet', () => {
        it('returns the categories as tree (no parent ID)', async () => {
            httpClient.get.mockResolvedValue({ data: data.categoriesGet, status: 200 });

            const result = await service.categoryTreeGet();

            expect(httpClient.get.mock.calls[0][0]).toEqual('/category-trees');
            expect(result.categorytree[0].id).toEqual(5);
            expect(result.categorytree[1].id).toEqual(2);
            expect(result.categorytree[1].children[0].id).toEqual(3);
            expect(result.categorytree[1].children[1].id).toEqual(4);
            expect(result.categorytree[2].id).toEqual(11);
        });
        it('returns the categories as tree (with parent ID)', async () => {
            const testCategory = data.categoriesGet.data[0].attributes.categoryNodesStorage[0];
            httpClient.get.mockResolvedValue({ data: data.categoriesGetParentId, status: 200 });

            const result = await service.categoryTreeGet(testCategory.nodeId);

            expect(httpClient.get.mock.calls[0][0]).toEqual('/category-nodes/' + testCategory.nodeId);
            expect(result.categorytree[0].id).toEqual(6);
            expect(result.categorytree[1].id).toEqual(7);
            expect(result.categorytree[2].id).toEqual(8);
        });
    });

    describe('categoriesCategoryIdsGet', () => {
        it('returns the categories pages with the given IDs', async () => {
            const testCategory = data.categoriesGetParentId.data;
            const categoryIds = [testCategory.attributes.nodeId, -999];
            httpClient.get
                .mockResolvedValueOnce({ data: data.categoriesGetParentId })
                .mockResolvedValue({ data: data.categoriesGetParentIdError });

            const result = await service.categoriesCategoryIdsGet(categoryIds);

            expect(result.categories.length).toEqual(1);
            expect(result.categories[0].id).toEqual(categoryIds[0]);
        });
    });
});
