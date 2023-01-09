const httpClient = require('../utils/http-client');
const service = require('./ContentService');
const data = require('./ContentPagesService.spec.data');

jest.mock('../../src/utils/http-client');

describe('ContentService', () => {
    describe('getContentUrl', () => {
        it('returns the correct URL', async () => {
            const contentId = data.fetchContentsById.data.id;
            httpClient.get.mockResolvedValue({ data: data.fetchContentsById, status: 200 });

            const result = await service.getContentUrl(contentId);

            expect(result).toEqual({ url: data.fetchContentsById.data.attributes.url });
        });
        it('throws an error when http call fails', async () => {
            const errorResponseStatus = 404
            const errorResponse = { data: data.fetchContentsByIdError, status: errorResponseStatus }
            httpClient.get.mockResolvedValue(errorResponse);

            try {
                service.getContentUrl(123);
            }
            catch (error) {
                expect(errorResponse).toEqual(error)
            }
        });
    });
    describe('contentContentIdsGet', () => {
        it('returns the content pages with the given IDs', async () => {
            const contentIds = [data.fetchContentsById.data.id, -999];
            httpClient.get.mockResolvedValueOnce({ data: data.fetchContentsById, status: 200 }).mockResolvedValue({ data: data.fetchContentsByIdError, status: 200 });

            const result = await service.contentContentIdsGet(contentIds);

            expect(result.content.length).toEqual(1);
            expect(result.content[0].id).toEqual(contentIds[0]);
        });
    });
    describe('contentGet', () => {
        it('returns all content pages', async () => {
            httpClient.get.mockResolvedValue({ data: data.fetchContents, status: 200 });

            const result = await service.contentGet();

            expect(result.content.length).toEqual(data.fetchContents.data.length);
            expect(result.total).toEqual(data.fetchContents.data.length);
            expect(result.hasNext).toEqual(false);
        });
    });
});
